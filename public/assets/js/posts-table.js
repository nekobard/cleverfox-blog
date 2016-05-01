var PostDeleteButton = React.createClass({
  render: function(){
    return(
      <button className="delete-button">Delete</button>
    );
  }
});

var PostRow = React.createClass({
  render: function() {
    var date = this.props.date.toString().substring(0,10);
    return (
      <li>
        <div className="column-admin">
          <h4>{this.props.title}</h4>
        </div>
        <div className="column-admin">
          <h4>{this.props.content}</h4>
        </div>
        <div className="column-admin">
          <h4>{this.props.author}</h4>
        </div>
        <div className="column-admin">
          <h4>{date}</h4>
        </div>
        <div className="column-admin">
          <button className="edit-button">Edit</button>
        </div>
        <div className="column-admin">
          <PostDeleteButton id={this.props.id}/>
        </div>
      </li>
    );
  }
});

var PostsTable = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadPostsFromServer: function() {
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
  componentDidMount: function() {
    this.loadPostsFromServer();
  },
  render: function() {
    var posts = this.state.data.reverse().map(function(post) {
      var longText = {
        title : function(){
          if(post.title.length > 10)
            return post.title.substring(0,10) + " ...";
          else
            return post.title;
        },
        content : function(){
          if(post.content.length > 10)
            return post.content.substring(0,10) + " ...";
          else
            return post.content;
        }
      }
      return (
        <PostRow author={post.author} key={post._id} id={post._id} title={longText.title()} content={longText.content()} date={post.created_at}/>
      );
    });

    return (
      <ul className="admin-posts">
        <li>
          <div className="column-admin">
            <h3>Title</h3>
          </div>
          <div className="column-admin">
            <h3>Content</h3>
          </div>
          <div className="column-admin">
            <h3>Author</h3>
          </div>
          <div className="column-admin">
            <h3>Date</h3>
          </div>
          <div className="column-admin"></div>
          <div className="column-admin"></div>
        </li>
        <hr className="table-separator"/>
        {posts}
      </ul>
    );
  }
});

ReactDOM.render(
  <PostsTable url="/api/posts" />,
  document.getElementById('posts-table')
);
