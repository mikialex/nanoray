import { BVHNode } from './bvh-node';
import { Vector3 } from '../math/vector3';
import { Scene } from '../core/scene';

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
  itemList: Raw[];

  parseScene(scene: Scene) {
    const list: Raw[] = [];
    scene.primitiveList.forEach((prim, index) => {
      list.push({
        aabbMin: prim.geometry.getAABBMin(),
        aabbMax: prim.geometry.getAABBMax(),
        center: prim.geometry.getCenter(),
        id: index
      })
    })
    this.itemList = list;
  }

  buildBVH() {
      this.root = new BVHNode(this.itemList, 0);
  }

  generateFlattenList() {
    
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

