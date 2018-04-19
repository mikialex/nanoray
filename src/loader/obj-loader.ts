// import { Vector3 } from "../math/vector3";
// import { Scene } from "../core/scene";
// import { Triangle } from "../geometry/triangle";
// import { Material } from "../core/material";
// import { SimpleMaterial } from "../material/simple-material";
// import { Primitive } from "../core/primitive";

// export class ObjFileLoader{
//   static loadFromObjString(str:string, scene:Scene) {
//     const rows = str.split('\n');
//     const vertice = [];
//     const triangles = [];
//     rows.forEach(row => {
//       row = row.trim();
//       if (row.length > 1) {
//         if (row[0] === 'v') {
//           let temp = row.split(' ');
//           vertice.push(new Vector3(Number(temp[1]), Number(temp[2]), Number(temp[3])));
//         } else if (row[0] === 'f') {
//           let temp = row.split(' ');
//           temp = temp.slice(1, temp.length);
//           temp = temp.map(item => {
//             let num = item.split('/');
//             return num[0];
//           })
//           if (temp.length === 3) {
//             if (Number(temp[2]) === 0) throw 'xx';
//             triangles.push(new Vector3(Number(temp[0]), Number(temp[1]), Number(temp[2])));
//           } else {
//             if (Number(temp[2]) === 0) throw 'xx';
//             if (Number(temp[3]) === 0) throw 'xx';
//             triangles.push(new Vector3(Number(temp[0]), Number(temp[1]), Number(temp[2])));
//             triangles.push(new Vector3(Number(temp[0]), Number(temp[2]), Number(temp[3])));
//           }
//         }
//       }
//     });

//     triangles.forEach(triangle => {
//       // if (triangle.x >= 1 && triangle.y >= 1 && triangle.z >= 1) {
//         const tri = new Triangle(
//           new Vector3(vertice[triangle.x - 1].x, vertice[triangle.x - 1].y, vertice[triangle.x - 1].z),
//           new Vector3(vertice[triangle.y - 1].x, vertice[triangle.y - 1].y, vertice[triangle.y - 1].z),
//           new Vector3(vertice[triangle.z - 1].x, vertice[triangle.z - 1].y, vertice[triangle.z - 1].z));
//         const mat = new SimpleMaterial(new Vector3(Math.random(), 0.6, 1), new Vector3(0, 0, 0));
//         scene.addPrimitive(new Primitive(tri, mat));
//       // }
//     })
//   }
// }