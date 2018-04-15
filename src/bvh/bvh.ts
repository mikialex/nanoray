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

export const maxDepth = 10;
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



  generateFlattenList() {
    let flattenList = [];
    function pushNode(tree: BVHTree,flattenList, node: BVHNode, offset) {
      node.offset = offset;
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

      // if (node.parent !== null) {
      //   if (node.isSelfLeft) {
      //     flattenList[flattenList.length - 5] = offset;
      //   } else {
      //     flattenList[flattenList.length - 4] = offset;
      //   }
      // }
      const nodeInfo = [
        
        node.aabbMin.x,
        node.aabbMin.y,
        node.aabbMin.z,

        node.aabbMax.x,
        node.aabbMax.y,
        node.aabbMax.z,

        (node.parent !== null) ? node.parent.offset : 0,
        node.leftNode ? offset + 12 : 0,
        node.leftNode ? offset + node.leftNode.getSubTreeNodeCount() * 12 : 0,
        
        // split,
        offset + node.getSubTreeNodeCount() * 12,
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
    return new Float32Array(this.flattenList);
  }

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

      array.push(0.5);
      array.push(0.5);
      array.push(0.5);
      array.push(0);

      array.push(0);
      array.push(0);
      array.push(0);
      array.push(0);
    });
    return new Float32Array(array);
  }


  // addHelperToScene(scene) { 
  //   function addHelpBox(node: BVHNode, scene: Object3D) {
  //     if (node.inuse) {
  //       const x = node.aabbMax.x - node.aabbMin.x;
  //       const y = node.aabbMax.y - node.aabbMin.y;
  //       const z = node.aabbMax.z - node.aabbMin.z;
  //       const box = new BoxGeometry(x, y, z);
  //       let mat;
  //       if (!node.leftNode && !node.rightNode) {
  //         mat = new MeshBasicMaterial({ color: 0x000000, opacity: 0.5 ,transparent:true});
  //       } else if(node.leftNode.inuse && node.rightNode.inuse) {
  //         mat = new MeshBasicMaterial({ color: 0x000000, wireframe: true, opacity: 0.5 });
  //       } else {
  //         mat = new MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });
  //       }
  //       const boxMesh = new Mesh(box, mat);
  //       boxMesh.position.set(node.center.x, node.center.y, node.center.z);
  //       scene.add(boxMesh);
  //       if (node.leftNode) {
  //         addHelpBox(node.leftNode, scene);
  //       }
  //       if (node.rightNode) {
  //         addHelpBox(node.rightNode, scene);
  //       }
  //     }
  //   }

  //   if (this.root) {
  //     const group = new Group();
  //     scene.add(group)
  //     addHelpBox(this.root, group);
  //   }
  // }

}

