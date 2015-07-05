/** @jsx React.DOM */

// global state to keep data until it times out
var memory = chrome.extension.getBackgroundPage().state
var DATA_KEY = "keychain_data"

var Login = React.createClass({
  componentDidMount: function() {
    // only one input at this point so focus on that
    var input = document.getElementsByTagName('input')[0]
    input.focus()
  },
  handleChange: function(event) {
    if (event.keyCode == 13) { 
      console.log("event enter")
      var that = this
      var target = event.target
      chrome.extension.getBackgroundPage().login(event.target.value, function(resp) {
        if (resp.Success) {
          console.log("update auth")
          that.props.updateAuth(true, resp.Items)
          //console.log(JSON.stringify(resp.Items, null, 4))
        }
        target.value = ''
      }) 
    }
  },
  render: function() {
    return (<div className="login"><p>Enter your password</p>
            <input type="password" onKeyDown={this.handleChange} /></div>);
  }
})

var Item = React.createClass({
  copyPassword: function(event) {
    chrome.extension.getBackgroundPage().copy(this.props.password)
  },
  selectNumbers: function(event) {
    var string = event.target.value
    var numbers = string.split(' ').map(function(n) { return parseInt(n, 10) })
    var password = this.props.password
    var pwdChars = numbers.map(function(n) { return password[n - 1] }).join('')
    event.target.value = pwdChars
  },
  render: function() {
    var text = ""
    if  (this.props.user) {
      text = " (" + this.props.user + ")"
    }
    return (<span><button onClick={this.copyPassword}>password</button><input id="number-txt" type="text" onClick={this.selectNumbers} />&nbsp;<span className="item-text" title={this.props.title + text}><b>{this.props.type}</b> {this.props.title}{text}</span></span>);
  }
});

var Search = React.createClass({
  handleChange: function(event) {
    this.props.updateFilter(event.target.value);
  },
  componentDidMount: function() {
    var searchTxtDiv = document.getElementById('search-txt')
    var input = searchTxtDiv.getElementsByTagName('input')[0]
    input.focus()
  },
  render: function() {
    return <div className="search"><input type="button" id="lock-btn" onClick={this.props.lock} value="lock"/><div id="search-txt"><input type="text" onChange={this.handleChange} /></div></div>
  }
});

var List = React.createClass({
  getInitialState: function() {
    return {
      items: []
    };
  },
  componentWillMount: function() {
    this.props.data = this.props.data || []
    var isWebform = function(item) {
      return item.TypeName === 'webforms.WebForm'
    }
    var isPassword = function(item) {
      return item.TypeName === 'passwords.Password'
    }
    var or = function(one, two) {
      return function(item) { return one(item) || two(item) }
    }
    var getDesignation = function(payload, designation) {
      var userField = payload.fields.filter(function(f) { return f.designation === designation}).map(function(f) {return f.value})
      var user = '<unknown>'
      if (userField.length > 0) {
        user = userField[0]
      }
      return user
    }

    var items = this.props.data.filter(or(isWebform, isPassword)).map(function (item) {
      //console.log('parse '+item.Title)
      var payload = JSON.parse(item.Payload)
      var user, password, type
      if (isWebform(item)) {
        var fields = payload.fields || []
        user = getDesignation(payload, 'username')
        password = getDesignation(payload, 'password')
        type = 'W'
      } else if (isPassword(item)) {
        user = ''
        password = payload.password
        type = 'P'
      }
      //console.log('end parse '+item.Title)
      return { title: item.Title, user: user, password: password, type: type }
    })

    this.setState({ items: items })
  },
  render: function() {
    this.props.filterText = this.props.filterText || ''
    var that = this
    var isInFilter = function(item) {
      var show = true
      if (that.props.filterText) {
        show = (item.title.toLowerCase().indexOf(that.props.filterText.toLowerCase())) > -1
      }
      return show
    }
    var items = this.state.items.filter(isInFilter).map(function (item) {
      return <li className="item"><Item title={item.title} user={item.user} password={item.password} type={item.type} /></li>;
    });
    return <ul className="list">{items}</ul>;
  }
});

var Main = React.createClass({
  getInitialState: function() {
    return {
      filterText: this.props.filterText,
      authenticated: this.props.authenticated,
      data: this.props.data
    };
  },
  componentWillMount: function() {
    var filter = ''
    var data = memory.get(DATA_KEY)
    var authenticated = !!data
    data = data || []
    if (authenticated) {
      var that = this
      memory.replaceCallbacks(DATA_KEY, function() {
        that.setState(that.resetState())
      })
    }
    this.setState({
      filterText: filter,
      authenticated: authenticated,
      data: data
    })
  },
  lock: function() {
    memory.remove(DATA_KEY)
    this.setState(this.resetState())
  },
  resetState: function() {
    return {
      filterText: '',
      authenticated: false,
      data: []
    }
  },
  updateAuth: function(status, data) {
    var that = this
    memory.set(DATA_KEY, data, function() { that.setState(that.resetState()) })

    this.setState({
      authenticated: status,
      data: data
    });
  },
  updateFilter: function(text) {
    this.setState({
      filterText: text
    });
  },
  render: function() {
    var components = <Login updateAuth={this.updateAuth} />
    if (this.state.authenticated) {
      components = [<Search updateFilter={this.updateFilter} lock={this.lock} />, <List data={this.state.data} filterText={this.state.filterText} />]
    }
    return (
      <div className="main">
        {components}
      </div>
    );
  }
});


/** @jsx React.DOM */
React.renderComponent(
  <Main />,
  document.getElementById('body')
)
