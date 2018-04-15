import { Raw, Axis, maxDepth } from './bvh';
import { Vector3 } from '../math/vector3';

export class BVHNode {
  aabbMin: Vector3;
  aabbMax: Vector3;
  center: Vector3;

  leftNode: BVHNode = null;
  rightNode: BVHNode = null;
  parent: BVHNode = null;
  overlaped = false;
  itemList: Raw[];
  depth: number;
  splitAxis: Axis;
  bestLeftPart: Raw[];
  bestRightPart: Raw[];

  offset: number;
  leftOffset: number;
  rightOffset: number;
  isSelfLeft: boolean;
  private _subTreeNodeCount: number = -1;


  constructor(itemList: Raw[], depth: number,farther:BVHNode, isLeft:boolean) { 
    this.depth = depth;
    calNodeInfo(this, itemList);
    if (farther) {
      this.parent = farther;
    }
    this.isSelfLeft = isLeft;
    if (this.itemList.length > 1 && this.depth < maxDepth) {
      calBestPartition(this.itemList, this.splitAxis, this);
      this.leftNode = new BVHNode(this.bestLeftPart, this.depth + 1, this, true);
      this.rightNode = new BVHNode(this.bestRightPart, this.depth + 1, this, false);
    }
  }

  getSubTreeNodeCount() {
    if (this.leftNode) {
      if (this._subTreeNodeCount === -1) {
        this._subTreeNodeCount = this.leftNode.getSubTreeNodeCount() + this.rightNode.getSubTreeNodeCount() + 1;
      } 
      return this._subTreeNodeCount;
    } else {
      this._subTreeNodeCount = 1;
      return this._subTreeNodeCount;
    }
  }

}

function calNodeInfo(node: BVHNode, itemList: Raw[]) {
  node.itemList = itemList;
  const xmin = calMin(itemList, Axis.X);
  const ymin = calMin(itemList, Axis.Y);
  const zmin = calMin(itemList, Axis.Z);
  const xmax = calMax(itemList, Axis.X);
  const ymax = calMax(itemList, Axis.Y);
  const zmax = calMax(itemList, Axis.Z);
  node.center = new Vector3(
    (xmin + xmax) * 0.5,
    (ymin + ymax) * 0.5,
    (zmin + zmax) * 0.5,
  );
  node.aabbMin = new Vector3(
    xmin, ymin, zmin
  );
  node.aabbMax = new Vector3(
    xmax, ymax, zmax
  );
  node.splitAxis = determinAxis(node.aabbMax, node.aabbMin);
  sortByAxis(itemList, node.splitAxis);
}


function calBestPartition(list: Raw[], axis: Axis, node: BVHNode) {
  let bestPartitionIndex = -1;
  let cost = Number.MAX_VALUE;
  let tempNewCost;
  for (let i = 0; i < 3; i++) {
    const startPosition = calMin(list, axis);
    const expand = calListExpand(list, axis);
    const sepIndex = calPartitionPosition(list, startPosition + expand * (i + 1) / 4, axis);
    const leftPart = list.slice(0, sepIndex);
    const rightPart = list.slice(sepIndex, list.length);
    if (leftPart.length === 0) {
      throw 'eerr'
    }
    tempNewCost = calCost(leftPart, rightPart);
    if (tempNewCost < cost) {
      cost = tempNewCost;
      bestPartitionIndex = sepIndex;
      node.bestLeftPart = leftPart;
      node.bestRightPart = rightPart;
    }
  }
  if (bestPartitionIndex !== -1) {
    node.overlaped = calIsOverlap(node.bestLeftPart, node.bestRightPart, node.splitAxis);
    return bestPartitionIndex;
  } else {
    throw 'cant find best partion index';
  }
}


// TODO recompute optimize here;
function calIsOverlap(leftList, rightList, axis) {
  return calMax(leftList, axis) >= calMin(rightList, Axis.X);
  // if (calMax(leftList, Axis.X) >= calMin(rightList, Axis.X)) {
  //   console.log('over');
  // }
}


function determinAxis(aabbMax: Vector3, aabbMin: Vector3) {
  const x = aabbMax.x - aabbMin.x;
  const y = aabbMax.y - aabbMin.y;
  const z = aabbMax.z - aabbMin.z;
  const max = Math.max(x, y, z);
  if (max === x) {
    return Axis.X;
  } else if (max === y) {
    return Axis.Y;
  } else {
    return Axis.Z;
  }
}


function calPartitionPosition(list: Raw[], partitionLine: number, axis: Axis) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    switch (axis) {
      case Axis.X:
        if (item.center.x > partitionLine) {
          return (i === 0) ? 1 : i;
        }
        break;
      case Axis.Y:
        if (item.center.y > partitionLine) {
          return (i === 0) ? 1 : i;
        }
        break;
      case Axis.Z:
        if (item.center.z > partitionLine) {
          return (i === 0) ? 1 : i;
        }
        break;
      default:
        break;
    }
  }
  return list.length;
}


function calCost(leftPart: Raw[], rightPart: Raw[]) {
  return calGroupSurfaceArea(leftPart) * leftPart.length +
    calGroupSurfaceArea(rightPart) * rightPart.length;
}

function calGroupSurfaceArea(list: Raw[]) {
  const x = calListExpand(list, Axis.X);
  const y = calListExpand(list, Axis.Y);
  const z = calListExpand(list, Axis.Z);
  return x * y + x * z + z * y;
}


function calMin(list: Raw[], axis: Axis) {
  if (list.length === 0) {
    return 0;
  }
  if (axis === Axis.X) {
    let aabbMin_minX = list[0].aabbMin.x;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_minX > list[i].aabbMin.x) {
        aabbMin_minX = list[i].aabbMin.x;
      }
    }
    return aabbMin_minX
  } else if (axis === Axis.Y) {
    let aabbMin_minY = list[0].aabbMin.y;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_minY > list[i].aabbMin.y) {
        aabbMin_minY = list[i].aabbMin.y;
      }
    }
    return aabbMin_minY;
  } else if (axis === Axis.Z) {
    let aabbMin_minZ = list[0].aabbMin.z;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_minZ > list[i].aabbMin.z) {
        aabbMin_minZ = list[i].aabbMin.z;
      }
    }
    return aabbMin_minZ;
  } else {
    throw 'not support axis in list expand'
  }
}

function calMax(list: Raw[], axis: Axis) {
  if (list.length === 0) {
    return 0;
  }
  if (axis === Axis.X) {
    let aabbMin_maxX = list[0].aabbMax.x;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_maxX < list[i].aabbMax.x) {
        aabbMin_maxX = list[i].aabbMax.x;
      }
    }
    return aabbMin_maxX;
  } else if (axis === Axis.Y) {
    let aabbMin_maxY = list[0].aabbMax.y;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_maxY < list[i].aabbMax.y) {
        aabbMin_maxY = list[i].aabbMax.y;
      }
    }
    return aabbMin_maxY
  } else if (axis === Axis.Z) {
    let aabbMin_maxZ = list[0].aabbMax.z;
    for (let i = 0; i < list.length; i++) {
      if (aabbMin_maxZ < list[i].aabbMax.z) {
        aabbMin_maxZ = list[i].aabbMax.z;
      }
    }
    return aabbMin_maxZ
  } else {
    throw 'not support axis in list expand'
  }
}

function calListExpand(list: Raw[], axis: Axis) {
  return calMax(list, axis) - calMin(list, axis);
}

function sortByAxis(itemList: Raw[], axis: Axis) {
  switch (axis) {
    case Axis.X:
      itemList.sort((a: Raw, b: Raw) => {
        if (a.center.x >= b.center.x) {
          return 1;
        } else {
          return -1;
        }
      })
      break;
    case Axis.Y:
      itemList.sort((a: Raw, b: Raw) => {
        if (a.center.y >= b.center.y) {
          return 1;
        } else {
          return -1;
        }
      })
      break;
    case Axis.Z:
      itemList.sort((a: Raw, b: Raw) => {
        if (a.center.z >= b.center.z) {
          return 1;
        } else {
          return -1;
        }
      })
      break;
  }
}

