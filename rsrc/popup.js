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
        if (!resp.Success) {
          console.log("update auth")
          that.props.updateAuth(true)
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

var List = React.createClass({
  render: function() {
    return <ul>
      <li>logins</li>
      <li>passwords</li>
    </ul>;
  }
})

var Main = React.createClass({
  getInitialState: function() {
    return {
      authenticated: false
    };
  },
  updateAuth: function(status) {
    this.setState({
      authenticated: status
    });
  },
  render: function() {
    return (
      <div>
        {this.state.authenticated ? <List /> : <Login updateAuth={this.updateAuth} />}
      </div>
    );
  }
});

/** @jsx React.DOM */
React.renderComponent(
  Main({}),
  document.getElementById('body')
)
