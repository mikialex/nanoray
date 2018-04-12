import { BVHNode } from './bvhNode';
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
  id: string;
}

export const maxDepth = 10;
export class BVHTree {
  root: BVHNode;
  itemList: Raw[];
  flattenList: BVHNode[] = [];
  hasAllocate = false;

  parseScene(scene: Scene) {
    const list: Raw[] = [];
    function parseNode(node: any, list: any[]) {
      if (node.geometry) {
        node.geometry.computeBoundingBox();
        const position = node.getWorldPosition();
        const item: Raw = {
          aabbMin: node.geometry.boundingBox.min,
          aabbMax: node.geometry.boundingBox.max,
          center: node.geometry.boundingBox.getCenter(),
          id: node.uuid,
        }
        item.aabbMin.setX(item.aabbMin.x + position.x);
        item.aabbMin.setY(item.aabbMin.y + position.y);
        item.aabbMin.setZ(item.aabbMin.z + position.z);

        item.aabbMax.setX(item.aabbMax.x + position.x);
        item.aabbMax.setY(item.aabbMax.y + position.y);
        item.aabbMax.setZ(item.aabbMax.z + position.z);

        item.center.setX(item.center.x + position.x);
        item.center.setY(item.center.y + position.y);
        item.center.setZ(item.center.z + position.z);
        list.push(item);
      }
      if (node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          parseNode(node.children[i], list);
        }
      }
    }
    parseNode(scene, list);
    list.sort((a: Raw, b: Raw) => {
      if (a.center.x >= b.center.x) {
        return 1;
      } else {
        return -1;
      }
    });
    // console.log('parseScene list',list);
    this.itemList = list;
  }

  buildBVH() {
    // this.flattenList.length === 100;
    if (!this.hasAllocate) {
      this.root = new BVHNode(0, 0, this.flattenList);
      this.hasAllocate = true;
    }
    build(this.root, this.itemList, 0, this.flattenList);
    console.log(this.root);
    console.log(this.flattenList);
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

