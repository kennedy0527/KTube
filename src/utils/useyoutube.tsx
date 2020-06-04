import {useContext} from 'react';
import {AuthContext} from '../context/auth-context';

export default () => {
  const {accessToken, signInSilently} = useContext(AuthContext);

  let errorTimes = 0;

  const fetchSinglePlaylist = async (playlistId: string) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}`;

      const resp = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      });
      const data = await resp.json();

      if (data.error) {
        errorTimes += 1;
        if (errorTimes >= 5) {
          throw new Error(data.error);
        }
        if (data.error.errors[0].reason !== 'dailyLimitExceeded') {
          await signInSilently();
          await fetchSinglePlaylist(playlistId);
        }

        throw new Error(data.error);
      } else {
        errorTimes = 0;
        const {items} = data;
        return items;
      }
    } catch (error) {
      console.log(error);

      throw new Error(error);
    }
  };
  const fetchPlaylists = async (nextPageToken?: string) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50`;
      const resp = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      });
      const data = await resp.json();

      if (data.error) {
        errorTimes += 1;
        console.log(data.error);
        if (errorTimes >= 5) {
          throw new Error(data.error.errors);
        }
        if (data.error.errors[0].reason !== 'dailyLimitExceeded') {
          await signInSilently();
          await fetchPlaylists();
        }

        throw new Error(data.error);
      } else {
        errorTimes = 0;
        const {items, nextPageToken} = data;
        const playlists = [...items];

        if (nextPageToken) {
          const nextPageItems = await fetchPlaylists(nextPageToken);
          playlists.push(...(nextPageItems || []));
        }
        return playlists;
      }
    } catch (error) {
      console.log(error);

      throw new Error(error);
    }
  };
  const fetchPlaylistItems = async (playlistId: string, nextPage = null) => {
    try {
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}`;
      if (nextPage) {
        url += `&pageToken=${nextPage}`;
      }
      const resp = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        errorTimes += 1;
        if (errorTimes >= 5) {
          throw new Error(data.error);
        }
        if (data.error.errors[0].reason !== 'dailyLimitExceeded') {
          await signInSilently();
          await fetchPlaylistItems(playlistId, nextPage);
        }
        // console.log(data);
        throw new Error(data.error);
      } else {
        errorTimes = 0;
        const {items, nextPageToken} = data;
        // console.log(data);
        const playlistItems = [...items];
        // console.log(nextPageToken);
        if (nextPageToken) {
          const nextPageItems = await fetchPlaylistItems(
            playlistId,
            nextPageToken,
          );
          playlistItems.push(...(nextPageItems || []));
        }
        return playlistItems;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  const fetchVideoInfo = async (videoId: string): Promise<any> => {
    try {
      let url = `https://www.youtube.com/get_video_info?video_id=${videoId}&hl=en&el=embedded&ps=default`;

      const resp = await fetch(url, {
        headers: new Headers({
          Referer: `https://youtube.com/watch?v=${videoId}`,
        }),
      });
      const data = await resp.text();
      let videoInfo: any = {};

      const videoInfoRespString = decodeURIComponent(data);

      const fields = videoInfoRespString.split('&');

      for (const field of fields) {
        const pair = field.split('=', 1);
        if (pair[0] === 'url_encoded_fmt_stream_map') {
          console.log(pair[1]);
        }

        if (pair[0] === 'player_response') {
          let playerResp = field.split('player_response=')[1];
          videoInfo = JSON.parse(playerResp);
          break;
        }
      }

      if (videoInfo) {
        // console.log(videoUrl);
        // const min = parseInt(
        //   Number(videoInfo.videoDetails.lengthSeconds) / 60,
        //   10,
        // );
        // const sec = Number(videoInfo.videoDetails.lengthSeconds) - 60 * min;
        // const videoTimeLength = `${min}:${sec < 10 ? `0${sec}` : sec}`;
        const title = videoInfo.videoDetails.title.replace(/\+/g, ' ');
        const thumbnails = videoInfo.videoDetails.thumbnail.thumbnails;

        return {
          videoId,
          title,
          videoTimeLength: Number(videoInfo.videoDetails.lengthSeconds) | 0,
          thumbnails,
        };
      }
    } catch (error) {
      console.log(error);
      return {};
      // throw new Error(error);
    }
  };

  const fetchPlayerJsCode = async (url: string, abortSignal?: any) => {
    try {
      const resp = await fetch(url, {
        signal: abortSignal && abortSignal.signal,
      });
      const jsCode = await resp.text();

      /**
       * from youtube-dl: https://github.com/ytdl-org/youtube-dl/blob/2791e80b60e1ca1c36b83ca93be35e7e5418a1c3/youtube_dl/extractor/youtube.py#L1371
       */
      const hardCodedPatterns = [
        '\\b[cs]\\s*&&\\s*[adf]\\.set\\([^,]+\\s*,\\s*encodeURIComponent\\s*\\(\\s*([a-zA-Z0-9$]+)\\(',
        '\\b[a-zA-Z0-9]+\\s*&&\\s*[a-zA-Z0-9]+\\.set\\([^,]+\\s*,\\s*encodeURIComponent\\s*\\(\\s*([a-zA-Z0-9$]+)\\(',
        '\\b([a-zA-Z0-9$]{2})\\s*=\\s*function\\(\\s*a\\s*\\)\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)',
        '([a-zA-Z0-9$]+)\\s*=\\s*function\\(\\s*a\\s*\\)\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)',
        '(["\\\'])signature\\1\\s*,\\s*([a-zA-Z0-9$]+)\\(',
        '\\.sig\\|\\|([a-zA-Z0-9$]+)\\(',
        'yt\\.akamaized\\.net/\\)\\s*\\|\\|\\s*.*?\\s*[cs]\\s*&&\\s*[adf]\\.set\\([^,]+\\s*,\\s*(?:encodeURIComponent\\s*\\()?\\s*([a-zA-Z0-9$]+)\\(',
        '\\b[cs]\\s*&&\\s*[adf]\\.set\\([^,]+\\s*,\\s*([a-zA-Z0-9$]+)\\(',
        '\\b[a-zA-Z0-9]+\\s*&&\\s*[a-zA-Z0-9]+\\.set\\([^,]+\\s*,\\s*([a-zA-Z0-9$]+)\\(',
        '\\bc\\s*&&\\s*a\\.set\\([^,]+\\s*,\\s*\\([^)]*\\)\\s*\\(\\s*([a-zA-Z0-9$]+)\\(',
        '\\bc\\s*&&\\s*[a-zA-Z0-9]+\\.set\\([^,]+\\s*,\\s*\\([^)]*\\)\\s*\\(\\s*([a-zA-Z0-9$]+)\\(',
        '\\bc\\s*&&\\s*[a-zA-Z0-9]+\\.set\\([^,]+\\s*,\\s*\\([^)]*\\)\\s*\\(\\s*([a-zA-Z0-9$]+)\\(',
      ];
      const environment = `
      var window = { location: {hostname: ''}};
      var document = {documentElement: {}};
      var matchMediaWindow=this;matchMediaWindow.matchMedia=function(a){return false;};
      `;

      let signatureFunctionName = '';
      for (const pattern of hardCodedPatterns) {
        const pttn = new RegExp(pattern);
        const res = pttn.exec(jsCode);
        if (res) {
          signatureFunctionName = res[1];
          // console.log(res);
          break;
        }
      }

      if (signatureFunctionName !== '') {
        var re = new RegExp(';}\\)\\(_yt_player\\)', 'g');
        let script = jsCode
          .replace(
            /var window=this;/g,
            'var window = { location: {hostname: {}}};',
          )
          .replace(
            re,
            `g.${signatureFunctionName}=${signatureFunctionName};})(_yt_player)`,
          );

        const signatureFunction = new Function(
          signatureFunctionName,
          `${environment}${script} return _yt_player.${signatureFunctionName};`,
        );

        return signatureFunction();
      }
      throw new Error('Cannot get Youtube player script');
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  const fetchWebPage = async (videoId: string, abortSignal?: any) => {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const resp = await fetch(url, {
        signal: abortSignal && abortSignal.signal,
      });
      const html = await resp.text();
      const pttn = new RegExp(
        "ytplayer.config\\s*=\\s*(\\{.*?\\});|[\\({]\\s*'PLAYER_CONFIG'[,:]\\s*(\\{.*?\\})\\s*(?:,'|\\))",
      );
      const ress = pttn.exec(html);

      if (ress && ress?.length >= 2) {
        const config = JSON.parse(ress[1]);
        const playerResp = JSON.parse(config.args.player_response);
        return {
          playerScriptUrl: `https://www.youtube.com${config.assets.js}`,
          playerResp,
        };
      }
      throw new Error(`Cannot Fetch Webpag for ${videoId}`);
      // console.log(JSON.parse(ress[1]));
      // console.log(JSON.parse(JSON.parse(ress[1]).args.player_response));
      // console.log(res);
    } catch (error) {
      console.log(error);
      return {
        playerScriptUrl: undefined,
        playerResp: undefined,
      };
    }
  };
  const analyzeVideoInfo = (
    videoInfo: any,
  ):
    | {
        videoId: string;
        title: string;
        videoTimeLength: number;
        thumbnailUrl: string;
      }
    | undefined => {
    try {
      if (videoInfo) {
        const {
          videoDetails: {videoId, title, lengthSeconds, thumbnail},
        } = videoInfo;
        // console.log(videoInfo);
        // const min = parseInt(Number(lengthSeconds) / 60, 10);
        // const sec = Number(lengthSeconds) - 60 * min;
        // const videoTimeLength = `${min}:${sec < 10 ? `0${sec}` : sec}`;

        const thumbnailUrl = thumbnail.thumbnails[3].url;

        return {
          videoId,
          title,
          videoTimeLength: Number(lengthSeconds) | 0,
          thumbnailUrl,
        };
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };
  const analyzeVideoUrl = async (
    videoInfo: any,
    playerScriptUrl: string,
    abortSignal?: any,
  ): Promise<any> => {
    try {
      const streamData: any = [];
      if (videoInfo && videoInfo.streamingData) {
        const {streamingData} = videoInfo;

        streamingData.formats.forEach((data: any) => {
          if (data.cipher) {
            const fields = data.cipher.split('&');
            const format: any = {};
            for (const field of fields) {
              const pair = field.split('=');

              if (pair.length === 2) {
                format[pair[0]] = decodeURIComponent(pair[1]);
              }
            }
            if (format !== {}) {
              streamData.push({
                itag: data.itag,
                qualityLabel: data.qualityLabel,
                ...format,
              });
            }
          } else if (data.signatureCipher) {
            const fields = data.signatureCipher.split('&');
            const format: any = {};
            for (const field of fields) {
              const pair = field.split('=');

              if (pair.length === 2) {
                format[pair[0]] = decodeURIComponent(pair[1]);
              }
            }
            if (format !== {}) {
              streamData.push({
                itag: data.itag,
                qualityLabel: data.qualityLabel,
                ...format,
              });
            }
          } else if (data.url) {
            streamData.push({url: data.url});
          }
        });
        // console.error(streamData);
        let videoUrl = '';
        if (streamData.length != 0) {
          if (streamData[0].s) {
            const unscrambleSignature = await fetchPlayerJsCode(
              playerScriptUrl,
              abortSignal,
            );
            const signature = unscrambleSignature(streamData[0].s);
            // console.log(signature);
            videoUrl = `${streamData[0].url}&${streamData[0].sp}=${signature}`;
          } else {
            videoUrl = streamData[0].url;
          }
        } else {
          // console.log('NO s');
          console.log('NO s', videoInfo);
        }

        return videoUrl;
      } else {
        // console.log('NO adaptiveFormats');
        console.log('NO streamingData', videoInfo);
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  };
  return {
    fetchPlaylists,
    fetchPlaylistItems,
    // fetchVideoInfo,
    fetchSinglePlaylist,
    fetchWebPage,
    analyzeVideoInfo,
    analyzeVideoUrl,
  };
};
