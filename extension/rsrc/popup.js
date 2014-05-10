/** @jsx React.DOM */
var Login = React.createClass({
  handleChange: function(event) {
    if (event.keyCode == 13) { 
      //event.preventDefault()
      console.log("event enter")
      var that = this
      var target = event.target
      chrome.extension.getBackgroundPage().login(event.target.value, function(resp) {
        if (resp.Success) {
          console.log("update auth")
          that.props.updateAuth(true, resp.Items)
          console.log(JSON.stringify(resp.Items, null, 4))
          //that.props.updateData()
        }
        target.value = ''
      }) 
    }
  },
  render: function() {
    return (<span><p>Enter your password</p>
            <input type="password" onKeyDown={this.handleChange} /></span>);
  }
})

var Item = React.createClass({
  copyPassword: function(event) {
    chrome.extension.getBackgroundPage().copy(this.props.password)
  },
  render: function() {
    return (<div>{this.props.title} | {this.props.user} <button onClick={this.copyPassword}>password</button></div>);
  }
});

var Search = React.createClass({
  handleChange: function(event) {
    this.props.updateFilter(event.target.value);
  },
  render: function() {
    return <span><input type="text" onChange={this.handleChange} /></span>
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
    var getDesignation = function(payload, designation) {
      var userField = payload.fields.filter(function(f) { return f.designation === designation}).map(function(f) {return f.value})
      var user = '<unknown>'
      if (userField.length > 0) {
        user = userField[0]
      }
      return user
    }

    var items = this.props.data.filter(isWebform).map(function (item) {
      console.log('parse '+item.Title)
      var payload = JSON.parse(item.Payload)
      var fields = payload.fields || []
      var user = getDesignation(payload, 'username')
      var password = getDesignation(payload, 'password')
      console.log('end parse '+item.Title)
      return { title: item.Title, user: user, password: password }
    });

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
      return <li><Item title={item.title} user={item.user} password={item.password}/></li>;
    });
    return <ul>{items}</ul>;
  }
});

var Main = React.createClass({
  getInitialState: function() {
    return {
      filterText: '',
      authenticated: false,
      data: []
    };
  },
  updateAuth: function(status, data) {
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
      components = [<span><Search updateFilter={this.updateFilter} /></span>, <span><List data={this.state.data} filterText={this.state.filterText} /></span>]
    }
    return (
      <div>
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
