/** @jsx React.DOM */
var Login = React.createClass({
  handleChange: function(event) {
    if (event.keyCode == 13) { 
      //event.preventDefault()
      console.log("event enter " + event.target.value)
      var that = this
      var target = event.target
      chrome.extension.getBackgroundPage().login(event.target.value, function(resp) {
        //var p = document.createElement("p")
        //p.innerText = resp.Success
        //document.body.appendChild(p)
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
  render: function() {
    return (<span>{this.props.title}, {this.props.user}</span>);
  }
});

var Search = React.createClass({
  handleChange: function(event) {
    this.props.updateFilter(event.target.value);
  },
  render: function() {
    return <span><input type="text" onKeyDown={this.handleChange} /></span>
  }
});

var List = React.createClass({
  render: function() {
    this.props.data = this.props.data || []
    this.props.filterText = this.props.filterText || ''
    var that = this
    var isWebform = function(item) {
      var show = true
      if (that.props.filterText) {
        show = (item.Title.toLowerCase().indexOf(that.props.filterText.toLowerCase())) > -1
      }
      return show && item.TypeName === 'webforms.WebForm'
    }
    var items = this.props.data.filter(isWebform).map(function (item) {
      console.log('parse '+item.Title)
      var payload = JSON.parse(item.Payload)
      var fields = payload.fields || []
      var userField = payload.fields.filter(function(f) { return f.designation === 'username'}).map(function(f) {return f.value})
      var user = '<unknown>'
      if (userField.length > 0) {
        user = userField[0]
      }
      //var user = 'test'
      console.log('end parse '+item.Title)
      return <li><Item title={item.Title} user={user}/></li>;
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
