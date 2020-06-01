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
  const formattedHours = padStart(Math.floor(time / 3600).toFixed(0), 2, '0');
  const formattedMinutes = padStart(Math.floor(time / 60).toFixed(0), 2, '0');
  const formattedSeconds = padStart(Math.floor(time % 60).toFixed(0), 2, '0');
  if (formattedSeconds === '00') {
    return '';
  } else if (formattedMinutes === '00') {
    return `${formattedSeconds} seconds`;
  } else if (formattedHours === '00') {
    return `${formattedMinutes} minutes`;
  } else {
    return `${formattedHours} hours ${formattedMinutes} minutes`;
  }
};
