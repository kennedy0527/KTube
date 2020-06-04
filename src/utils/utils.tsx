import padStart from 'lodash/padStart';

export const shuffle = (array: Array<any>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const formatTime = (time: number) => {
  const formattedHours = padStart(Math.floor(time / 3600).toFixed(0), 2, '0');
  const formattedMinutes = padStart(Math.floor(time / 60).toFixed(0), 2, '0');
  const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');
  if (formattedHours === '00') {
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
};

export const convertToDuration = (time: number) => {
  const hours = Math.floor(time / 3600).toFixed(0);
  const minutes = Math.floor(time / 60).toFixed(0);
  const seconds = Math.floor(time % 60).toFixed(0);
  const formattedHours = padStart(hours, 2, '0');
  const formattedMinutes = padStart(minutes, 2, '0');
  const formattedSeconds = padStart(seconds, 2, '0');

  if (formattedHours !== '00') {
    return `${formattedHours} hours ${formattedMinutes} minutes`;
  } else if (formattedMinutes !== '00') {
    return `${minutes} minutes`;
  } else if (formattedSeconds !== '00') {
    return `${seconds} seconds`;
  } else {
    return '';
  }
};
