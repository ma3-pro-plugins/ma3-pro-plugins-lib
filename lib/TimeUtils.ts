import { gettime } from 'socket';

export function getTimeMillis() {
  return gettime() * 1000;
}

export const TimeUtils = {
  getTimeMillis,
};
