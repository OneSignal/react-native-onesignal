/**
 Method that returns a Promise that timeouts out the thread it is on for X millis
 */
export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}