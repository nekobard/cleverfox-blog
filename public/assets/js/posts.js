var Post = React.createClass({
  render: function() {
    var date = this.props.date.toString().substring(0,10);
    return (
      <article>
        <h2>{this.props.title}</h2>
        <h3>Posted by {this.props.author}, {date}</h3>
        <p>{this.props.content}</p>
        <div>
          <a href={this.props.url}>Read more</a>
        </div>
      </article>
    );
  }
});

var PostsList = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var posts = this.state.data.reverse().map(function(post) {
      return (
        <Post author={post.author} key={post._id} url= {"/details/" + post._id} title={post.title} content={post.content} date={post.created_at}/>
      );
    });
    return (
      <div>
        {posts}
      </div>
    );
  }
});

ReactDOM.render(
  <PostsList url="/api/posts" />,
  document.getElementById('posts')
);
