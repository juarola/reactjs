var SuperButton = React.createClass({displayName: "SuperButton",
    localHandleClick: function(){
        this.props.localHandleClick(this.props.increment);
    },
   render: function(){
       return (
           React.createElement("button", {onClick: this.localHandleClick}, "+", this.props.increment)
       )
   } 
});

var Result = React.createClass({displayName: "Result",
   render: function(){
       return(
           React.createElement("div", null, this.props.localCounter)
       )
   } 
});

var Main = React.createClass({displayName: "Main",
    getInitialState:function(){
        return {counter:0};
    },
    handleClick:function(increment){
        this.setState({counter: this.state.counter + increment});
    },
    render: function(){
        return(
            React.createElement("div", null, 
                React.createElement(SuperButton, {localHandleClick: this.handleClick, increment: 1}), 
                React.createElement(SuperButton, {localHandleClick: this.handleClick, increment: 5}), 
                React.createElement(SuperButton, {localHandleClick: this.handleClick, increment: 10}), 
                React.createElement(Result, {localCounter: this.state.counter})
            )
        )
    }
})

React.render(React.createElement(Main, null), document.getElementById('root'));