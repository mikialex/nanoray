export const triangleSceneJson = [
  {
    type: 'triangle',  //light
    geo: {
      x:[0,0,1],
      y:[0,1,0],
      z:[1,1,0],
    },
    mate: {
      color: [1, 0, 0],
      lightness: [0,0, 0],
    }
  },
  {
    type: 'triangle',
    geo: {
      x:[1,1,0],
      y:[0,-1,0],
      z:[0,0,0],
    },
    mate: {
      color: [0, 0.96, 0],
      lightness: [0.0, 0.1, 0.0],
    }
  },
]