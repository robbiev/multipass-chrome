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
    return <span>{this.props.title}</span>
  }
});

var List = React.createClass({
  render: function() {
    this.props.data = this.props.data || []
    var items = this.props.data.map(function (item) {
      return <li><Item title={item.Title} /></li>;
    });
    return <ul>{items}</ul>;
  }
});

var Main = React.createClass({
  getInitialState: function() {
    return {
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
  render: function() {
    return (
      <div>
        {this.state.authenticated ? <List data={this.state.data}/> : <Login updateAuth={this.updateAuth} />}
      </div>
    );
  }
});


/** @jsx React.DOM */
React.renderComponent(
  <Main />,
  document.getElementById('body')
)
