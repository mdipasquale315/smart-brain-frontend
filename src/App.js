import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';

import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';

import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin', // start at signin
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({ 
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  // Calculate face location safely
  calculateFaceLocation = (data) => {
    if (
      !data.outputs ||
      !data.outputs[0] ||
      !data.outputs[0].data.regions ||
      data.outputs[0].data.regions.length === 0
    ) {
      return null; // no face detected
    }
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');

    if (!image) return null;

    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch('https://smart-brain-backend-l6cv.onrender.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: this.state.input }),
    })
      .then(res => res.json())
      .then(response => {
        console.log('API response:', response);
        const faceBox = this.calculateFaceLocation(response);
        console.log('Face box:', faceBox);
        if (faceBox) {
          this.displayFaceBox(faceBox);
        } else {
          this.displayFaceBox({});
        }
        // Update user entries
        fetch('https://smart-brain-backend-l6cv.onrender.com/image', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: this.state.user.id }),
        })
        .then(res => res.json())
        .then(count => {
          console.log('Entries count:', count);
          this.setState({ user: { ...this.state.user, entries: count } });
        })
        .catch(err => console.log('Entries update error:', err));
      })
      .catch(err => {
        console.log('Error in face detection call:', err);
        this.displayFaceBox({});
      });
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true, route });
    } else {
      this.setState({ route });
    }
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <ParticlesBg type="circle" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home' ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === 'signin' ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}

export default App;
