var SuperButton = React.createClass({
    localHandleClick: function(){
        this.props.localHandleClick(this.props.increment);
    },
   render: function(){
       return (
           <button onClick={this.localHandleClick}>+{this.props.increment}</button>
       )
   } 
});

var Result = React.createClass({
   render: function(){
       return(
           <div>{this.props.localCounter}</div>
       )
   } 
});

var Main = React.createClass({
    getInitialState:function(){
        return {counter:0};
    },
    handleClick:function(increment){
        this.setState({counter: this.state.counter + increment});
    },
    render: function(){
        return(
            <div>
                <SuperButton localHandleClick={this.handleClick} increment={1} />
                <SuperButton localHandleClick={this.handleClick} increment={5} />
                <SuperButton localHandleClick={this.handleClick} increment={10} />
                <Result localCounter={this.state.counter} />
            </div>
        )
    }
})

React.render(<Main />, document.getElementById('root'));