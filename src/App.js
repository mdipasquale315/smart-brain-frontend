// Inside Signin component after successful login:
fetch('your-backend-signin-endpoint', {...})
  .then(res => res.json())
  .then(user => {
    if (user.id) {
      this.props.loadUser(user);
      this.props.onRouteChange('home');
    }
  })
