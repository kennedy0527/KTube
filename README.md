<p align="center"><img src="KTubeImages/light/iTunesArtwork@1x.png" width="100" height="100"></p>

<p align="center">
<a style="display: inline-block" href="https://GitHub.com/kennedy0527/KTube/blob/develop/LICENSE/"><img src="https://img.shields.io/github/license/kennedy0527/KTube?style=for-the-badge" /></a>
<a style="display: inline-block" href="https://GitHub.com/kennedy0527/KTube/tags/"><img src="https://img.shields.io/github/v/tag/kennedy0527/KTube?style=for-the-badge" /></a>
</p>

<h1 align="center">KTube</h1>

Youtube Background Music App

This is my personal side project for improve my React and React Native skill,

also I'm a music lover, so I made this app for myself to listen Youtube music video more convenient and also ad free !!

some code is pretty ugly I know, so feel free to give some advices to me :D

![](KTubeImages/Story-2.png)

# Usage

## Before you start

go to [Google Cloud Platform](https://cloud.google.com) to create your project with `YouTube Data API v3`

then create `OAuth 2.0 credential` with type `iOS`

create `.env` file under `project folder`, then put your `client id` like below

```
  IOS_CLIENT_ID=your client id
```

## Installation

```
  yarn install
  cd ios & pod install
```

You can now run the app with

```
  npx react-native run-ios
```

# Functionalities

- Google Sign In
- Youtube Backgorund Music
- Dark Mode
- Automatically change app icon by theme (light & dark)
- Import playlist from youtube by Youtube API and Playlist URL
- Save your favorite video anytime (favorites list)

# TODO

- sort favorites list to any position you want, not only reverse it
- performance improve, especially `Flatlist`
- Maybe fully abandon to use Youtube Data API because it's useless..., need to find a way to get playlist data

# Known Issue

- App in background (video stop) for long time, can not be able to restart video from the control center.

if you found any issue please let me know, thanks

# Credits

Youtube URL extraction algorithms are inspired by [youtube-dl Project](https://github.com/ytdl-org/youtube-dl)

# License

KTube is available under the MIT license. See the [LICENSE](LICENSE) file for more information.
