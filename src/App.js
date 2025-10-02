import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',
    }
}

export default class App extends Component {
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
        })
    }

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({ isSignedIn: true })
        }
        this.setState({ route: route })
    }

    calculateFaceLocation = (data) => {
        console.log('Full API Response:', data);
        
        if (data.error) {
            console.error('API Error:', data.error);
            alert('Error: ' + data.error);
            return null;
        }
        
        if (!data.data || !data.data.regions || data.data.regions.length === 0) {
            console.log('No faces detected in image');
            alert('No faces detected in this image');
            return null;
        }
        
        const clarifaiFaceDetect = data.data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const imageWidth = Number(image.width);
        const imageHeight = Number(image.height);
        
        return {
            topRow: clarifaiFaceDetect.top_row * imageHeight,
            leftCol: clarifaiFaceDetect.left_col * imageWidth,
            rightCol: imageWidth - (clarifaiFaceDetect.right_col * imageWidth),
            bottomRow: imageHeight - (clarifaiFaceDetect.bottom_row * imageHeight)
        }
    }

    displayFaceBox = (box) => {
        if (box) {
            this.setState({ box: box })
        }
    }

    onInputChange = (event) => {
        this.setState({ input: event.target.value })
    }

    onButtonSubmit = () => {
        this.setState({ imageUrl: this.state.input })

        fetch('https://smart-brain-backend-l6cv.onrender.com/imageurl', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            .then(result => {
                const box = this.calculateFaceLocation(result);
                
                if (box) {
                    this.displayFaceBox(box);
                    
                    fetch('https://smart-brain-backend-l6cv.onrender.com/image', {
                        method: 'put',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response => response.json())
                        .then(count => {
                            this.setState(Object.assign(this.state.user, { entries: count }))
                        })
                        .catch(err => console.log('Error updating count:', err))
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                alert('Failed to process image. Please try again.');
            })
    }

    render() {
        const { isSignedIn, imageUrl, route, box } = this.state;
        return (
            <div className="App">
                <ParticlesBg type="cobweb" bg={true} />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
                <Logo />
                { route === 'home'
                    ? <div>
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
                    : (
                        route === 'signin'
                        ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                        : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
}
