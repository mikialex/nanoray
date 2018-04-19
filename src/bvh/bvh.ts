import { BVHNode } from './bvh-node';
import { Vector3 } from '../math/vector3';
import { Scene } from '../core/scene';
import { Primitive } from '../core/primitive';
import { Triangle } from '../geometry/triangle';

export enum Axis {
  X,
  Y,
  Z
}

export interface Raw {
  aabbMin: Vector3;
  aabbMax: Vector3;
  center: Vector3;
  id: number;
}

export const maxDepth = 50;

export const dataRowWidthNode = 1000; // each row has how many node
export const bvhSingleNodeDataWidth = 12;  // each bvhnode need 12 float
export const bvhPackedSingleNodePixelDataWidth = bvhSingleNodeDataWidth / 4; // 3(rgba),using rgba, each bvhnode need 3 pixel
export const dataRowWidthPixel = dataRowWidthNode * bvhPackedSingleNodePixelDataWidth; // how many pixel in one row

export const dataRowWidthTriangle = 500; // each row has how many triangle
export const singleTriangleDataWidth = 20;  // each triangle need 20 float
export const PackedSingleTrianglePixelDataWidth = singleTriangleDataWidth / 4; // 5(rgba),using rgba, each triangle need 5 pixel
export const dataRowWidthPixelTriangle = dataRowWidthTriangle * PackedSingleTrianglePixelDataWidth; // how many pixel in one row

declare var THREE;

export class BVHTree {
  root: BVHNode;
  itemList: Raw[]
  triangBVHList: Raw[] = [];
  triangleList: Primitive[];
  flattenList: number[] = [];

  parseScene(scene: Scene) {
    const list: Raw[] = [];
    this.triangleList = scene.primitiveList;
    scene.primitiveList.forEach((prim, index) => {
      list.push({
        aabbMin: prim.geometry.getAABBMin(),
        aabbMax: prim.geometry.getAABBMax(),
        center: prim.geometry.getCenter(),
        id: index
      })
    })
    this.itemList = list;
    console.log('parseScene', this.itemList);
  }

  buildBVH() {
    this.root = new BVHNode(this.itemList, 0, null, false);
    console.log('parsed root', this.root);
  }

  addHelperToScene(sceneToAdd) {
    function addHelpBox(node: BVHNode, scene: any, left:boolean) {
      
      const x = node.aabbMax.x - node.aabbMin.x;
      const y = node.aabbMax.y - node.aabbMin.y;
      const z = node.aabbMax.z - node.aabbMin.z;
      // if (x > 0.1 && y > 0.1 && z > 0.1 && node.leftNode === null) {
      //   throw 'err'
      // }

      const cx = (node.aabbMax.x + node.aabbMin.x) / 2;
      const cy = (node.aabbMax.y + node.aabbMin.y) / 2;
      const cz = (node.aabbMax.z + node.aabbMin.z) / 2;

      const box = new THREE.BoxGeometry(x, y, z);

      let matLine = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
      
      const matNormal = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });
      let boxMesh;
      // if (node.leftNode !== null) {
      //   boxMesh = new THREE.Mesh(box, matLine);
      // } else {
      //   boxMesh = new THREE.Mesh(box, matLine);
      //   scene.add(boxMesh);
      // }
      if (node.leftNode === null) {
        boxMesh = new THREE.Mesh(box, matLine);
        boxMesh.position.set(cx, cy, cz);
        scene.add(boxMesh);
      }
      // scene.add(boxMesh);
      
      if (node.leftNode !== null) {
        addHelpBox(node.leftNode, scene, true);
        addHelpBox(node.rightNode, scene, false);
      }
    }
    addHelpBox(this.root, sceneToAdd, true);
  }



  generateFlattenList() {
    let flattenList = [];
    function pushNode(tree: BVHTree,flattenList, node: BVHNode, offset) {
      node.offset = offset / bvhSingleNodeDataWidth;
      let split = 0;
      if (node.splitAxis = Axis.Y) {
        split = 1;
      }
      if (node.splitAxis = Axis.Z) {
        split = 2;
      }

      let start, end;
      if (!node.leftNode) {
        start = tree.triangBVHList.length;
        node.itemList.forEach(tri => {
          tree.triangBVHList.push(tri);
        })
        end = tree.triangBVHList.length;
      } else {
        start = 0;
        end = 0;
      }

      const nodeInfo = [
        
        node.aabbMin.x,
        node.aabbMin.y,
        node.aabbMin.z,
        node.aabbMax.x,

        node.aabbMax.y,
        node.aabbMax.z,
        (node.parent !== null) ? node.parent.offset : 0,
        node.leftNode ? node.offset + 1 : 0,
        
        node.leftNode ? node.offset + node.leftNode.getSubTreeNodeCount() : 0,
        node.offset + node.getSubTreeNodeCount(),
        start,
        end,
      ]  
      nodeInfo.forEach(data => {
        flattenList.push(data);
      })
      if (node.leftNode) {
        pushNode(tree, flattenList, node.leftNode, flattenList.length);
        pushNode(tree, flattenList, node.rightNode, flattenList.length);
      }
    }
    pushNode(this,flattenList, this.root, 0);
    this.flattenList = flattenList;
    console.log('flatten', this.flattenList);
  }

  BVHToDataArray() {
    this.bvhNodeNumber = this.flattenList.length / bvhSingleNodeDataWidth;
    this.bvhRowCount = Math.floor(this.bvhNodeNumber / dataRowWidthNode) + 1;
    this.bvhListLengthAll = this.bvhRowCount * bvhPackedSingleNodePixelDataWidth * dataRowWidthNode;

    let fillNumber = (this.bvhListLengthAll - this.bvhNodeNumber * bvhPackedSingleNodePixelDataWidth) * 4;
    console.log(this.bvhNodeNumber);
    console.log(this.bvhRowCount);
    console.log(this.bvhListLengthAll);
    console.log(fillNumber);
    for (let i = 0; i < fillNumber; i++) {
      this.flattenList.push(0);
      this.flattenList.push(0);
      this.flattenList.push(0);
      this.flattenList.push(0);
    }
    return new Float32Array(this.flattenList);
  }

  bvhListLengthAll = 0;
  bvhRowCount = 0;
  bvhNodeNumber = 0;

  triangleNum = 0;
  triangleRowCount = 0;
  triangleListLengthAll = 0;

  BVHTriangleToDataArray() {
    let array = [];
    this.triangBVHList.forEach(triIndex => {
      let tri  = (this.triangleList[triIndex.id].geometry as Triangle);
      array.push(tri.p1.x);
      array.push(tri.p1.y);
      array.push(tri.p1.z);
      array.push(0);

      array.push(tri.p2.x);
      array.push(tri.p2.y);
      array.push(tri.p2.z);
      array.push(0);

      array.push(tri.p3.x);
      array.push(tri.p3.y);
      array.push(tri.p3.z);
      array.push(0);

      array.push(0.8);
      array.push(0.8);
      array.push(0.8);
      array.push(0);

      array.push(0);
      array.push(0);
      array.push(0);
      array.push(0);
    });

    this.triangleNum = this.triangBVHList.length;
    this.triangleRowCount = Math.floor(this.triangleNum / dataRowWidthTriangle) + 1;
    this.triangleListLengthAll = this.triangleRowCount * PackedSingleTrianglePixelDataWidth * dataRowWidthTriangle;

    let fillNumber = (this.triangleListLengthAll - this.triangleNum * PackedSingleTrianglePixelDataWidth) * 4;
    console.log(this.triangleNum);
    console.log(this.triangleRowCount);
    console.log(this.triangleListLengthAll);
    console.log(fillNumber);
    for (let i = 0; i < fillNumber; i++) {
      for (let j = 0; j < 20; j++) {
        array.push(0);
      }
    }

    return new Float32Array(array);
  }

}

