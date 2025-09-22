import React, { Component } from 'react';

class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signInEmail: '',
      signInPassword: '',
      errorMessage: '' // optional: for inline error display
    };
  }

  onEmailChange = (event) => {
    this.setState({ signInEmail: event.target.value });
  };

  onPasswordChange = (event) => {
    this.setState({ signInPassword: event.target.value });
  };

  onSubmitSignIn = (event) => {
    event.preventDefault(); // prevent page refresh

    fetch('https://smart-brain-backend-l6cv.onrender.com/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.state.signInEmail,
        password: this.state.signInPassword
      })
    })
      .then(res => res.json())
      .then(user => {
        if (user.id) {
          this.props.loadUser(user);
          this.props.onRouteChange('home');
          // Optional: clear inputs
          this.setState({ signInEmail: '', signInPassword: '' });
        } else {
          this.setState({ errorMessage: 'Sign in failed. Please check your credentials.' });
        }
      })
      .catch(err => {
        console.log('Error:', err);
        this.setState({ errorMessage: 'Error signing in. Please try again later.' });
      });
  };

  render() {
    return (
      <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l shadow-5 center">
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_in" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Sign In</legend>
              {/* Wrap inputs inside a form */}
              <form onSubmit={this.onSubmitSignIn}>
                <div className="mt3">
                  <label className="db fw6 lh-copy f6" htmlFor="email-address">
                    Email
                  </label>
                  <input
                    className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    type="email"
                    name="email"
                    id="email-address"
                    onChange={this.onEmailChange}
                    value={this.state.signInEmail}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="mv3">
                  <label className="db fw6 lh-copy f6" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                    type="password"
                    name="password"
                    id="password"
                    onChange={this.onPasswordChange}
                    value={this.state.signInPassword}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {/* Submit button */}
                <div className="">
                  <input
                    className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                    type="submit"
                    value="Sign in"
                  />
                </div>
              </form>
              {this.state.errorMessage && (
                <p className="mt3 red">{this.state.errorMessage}</p>
              )}
            </fieldset>
            <div className="lh-copy mt3">
              <p
                onClick={() => this.props.onRouteChange('register')}
                className="f6 link dim black db pointer"
              >
                Register
              </p>
            </div>
          </div>
        </main>
      </article>
    );
  }
}

export default Signin;
