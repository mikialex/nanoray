class Id {
  static id = 0;
  static getId() {
    Id.id++;
    return Id.id;
  }
}

class Vector {
  dx: number;
  dy: number;
}

class Point {
  uuid: number = Id.id;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  x: number;
  y: number;

  fromLineSectionList: Array<LineSection>;
  toLineSectionList: Array<LineSection>;
  fromStartHalfLineList: Array<HalfLine>;
  fromEndHalfLineList: Array< HalfLine>;
  lineList: Array<Line>;

  findFromLineSectionByLine(line: Line):LineSection {  ////
    let fromLineSection;
    this.fromLineSectionList.forEach(lineSection => {
      if (lineSection.line.uuid === line.uuid) {
        fromLineSection = lineSection;
      }
    })
    if (fromLineSection === undefined) {
      throw 'bad result in linesection find'
    }
    return fromLineSection;
  }

  addfromStartHalfLineList(hf:HalfLine) {
    this.fromStartHalfLineList.push(hf);
  }
  removefromStartHalfLineList(hf: HalfLine) {
    this.fromStartHalfLineList.filter(halfline => { return halfline.uuid !== hf.uuid });
  }

  addfromEndHalfLineList(hf: HalfLine) {
    this.fromEndHalfLineList.push(hf);
  }
  removefromEndHalfLineList(hf: HalfLine) {
    this.fromEndHalfLineList.filter(halfline => { return halfline.uuid !== hf.uuid });
  }

  addfromLineSectionList(ls: LineSection) {
    this.fromLineSectionList.push(ls);
  }
  removefromLineSectionList(ls: LineSection) {
    this.fromLineSectionList.filter(lineSection => { return lineSection.uuid !== ls.uuid });
  }

  addtoLineSectionList(ls: LineSection) {
    this.toLineSectionList.push(ls);
  }
  removetoLineSectionList(ls: LineSection) {
    this.fromStartHalfLineList.filter(lineSection => { return lineSection.uuid !== ls.uuid });
  }
  addLineList(line: Line) {
    this.lineList.push(line);
  }

  hitCross(line: Line) {
    this.addLineList(line);
  }
}

class HalfLine {
  constructor(isStartHalfLine: boolean, point: Point, direction: Vector) {
    this.isStartHalfLine = isStartHalfLine;
    this.point = point;
    this.direction = direction;
  }
  uuid: number = Id.id;
  isStartHalfLine: boolean;
  point: Point;
  direction: Vector;
  line: Line;

  split(otherLine: Line, secPoint: Point) {
    let newHalfLine = new HalfLine(this.isStartHalfLine, secPoint, this.direction);
    let newLineSection = new LineSection(this.point, secPoint);
    this.line.addLineSection(newLineSection); 
    this.point.addtoLineSectionList(newLineSection);
    secPoint.addLineList(otherLine);
    secPoint.addLineList(this.line);
    if (this.isStartHalfLine) {
      this.point.removefromStartHalfLineList(this);
      this.line.startHalfLine = newHalfLine;
      secPoint.addfromStartHalfLineList(newHalfLine);
      secPoint.addtoLineSectionList(newLineSection);
    } else {
      this.point.removefromEndHalfLineList(this);
      this.line.endHalfLine = newHalfLine;
      secPoint.addfromEndHalfLineList(newHalfLine);
      secPoint.addfromLineSectionList(newLineSection);
    }
  }
}

class Line {
  constructor(direction: Vector, point: Point) {
    this.direction = direction;
    this.point = point;
  }
  uuid: number;
  direction: Vector
  point: Point
  selfLineSectionList: Array<LineSection>;
  selfinterSectionPointList: Array<Point>;
  startHalfLine: HalfLine;
  endHalfLine: HalfLine;
  addselfLineSectionList(ls:LineSection) {
    this.selfLineSectionList.push(ls);
  }
  removeselfLineSectionList(ls: LineSection) {
    this.selfLineSectionList.filter(lineSection => { return lineSection.uuid !== ls.uuid });
  }
  addselfinterSectionPointList(p: Point) {
    this.selfinterSectionPointList.push(p);
  }
  removeselfinterSectionPointList(p: Point) {
    this.selfinterSectionPointList.filter(point => { return point.uuid !== p.uuid });
  }

  interSectWithLine(otherLine: Line) {
    if (!this.testPall(otherLine)) {
      let interSectionPoint = this.getInterSectionPoint(otherLine);
      Line.intersectModify(this, otherLine, interSectionPoint);
      Line.intersectModify(otherLine, this, interSectionPoint);
    } else {
      console.log('paral');
    }
  }

  static intersectModify(secedLine: Line, otherLine: Line, interSectionPoint:Point) {
    if (secedLine.selfinterSectionPointList.length !== 0) {

      let compareList; //相交点排序数组
      let compareVar = secedLine.direction.dx === 0 ? 'y' : 'x'; //横坐标相同，应该纵向比较排序
      let compareValue = compareVar === 'y' ? interSectionPoint.y : interSectionPoint.x;
      compareList = secedLine.selfinterSectionPointList.map(intP => {
        return {
          value: compareVar === 'y' ? intP.y : intP.x,
          point: intP
        }
      })
      compareList.sort();

      for (let i = 0; i < compareList.length; i++) {
        const p = compareList[i];
        if (i === 0 && compareValue < p.value) {
          if (compareVar === 'y') {
            if (secedLine.direction.dy > 0) {
              secedLine.startHalfLine.split(otherLine, interSectionPoint);
            } else {
              secedLine.endHalfLine.split(otherLine, interSectionPoint);
            }
          } else {
            if (secedLine.direction.dx > 0) {
              secedLine.startHalfLine.split(otherLine, interSectionPoint);
            } else {
              secedLine.endHalfLine.split(otherLine, interSectionPoint);
            }
          }
        } else if (i !== 0 && i !== compareList.length && compareValue < p.value) {
          let sec = p.point.findFromLineSectionByLine(secedLine).split(otherLine, interSectionPoint);
        } else if (i === compareList.length && compareValue < p.value) {
          if (compareVar === 'y') {
            if (secedLine.direction.dy > 0) {
              secedLine.endHalfLine.split(otherLine, interSectionPoint);
            } else {
              secedLine.startHalfLine.split(otherLine, interSectionPoint);
            }
          } else {
            if (secedLine.direction.dx > 0) {
              secedLine.endHalfLine.split(otherLine, interSectionPoint);
            } else {
              secedLine.startHalfLine.split(otherLine, interSectionPoint);
            }
          }
        } else if (compareValue === p.value) {
          p.point.hitCross(secedLine);
        }
      }

    } else {
      secedLine.split(otherLine, interSectionPoint);
    }
  }


  split(otherLine: Line, secPoint: Point) {
    let start = new HalfLine(true, secPoint, this.direction);
    let end = new HalfLine(false, secPoint, this.direction);
    this.startHalfLine = start;
    this.endHalfLine = end;
    secPoint.addLineList(otherLine);
    secPoint.addLineList(this);
    secPoint.addfromEndHalfLineList(end);
    secPoint.addfromStartHalfLineList(start);
  }

  getInterSectionPoint(otherLine: Line) {
    let la = this.direction.dy;
    let lb = -this.direction.dx;
    let lc = this.direction.dy * this.point.x - this.direction.dx * this.point.y;
    let ka = otherLine.direction.dy;
    let kb = -otherLine.direction.dx;
    let kc = otherLine.direction.dy * otherLine.point.x - otherLine.direction.dx * otherLine.point.y;
    let x = (lb * kc - kb * lc) / (lb * ka - kb * la);
    let y = (lc * ka - kc * la) / (lb * ka - kb * la);
    return new Point(x, y);
  }
  testPall(otherLine: Line) {
    // if (this.direction.dy !== 0 &&other.direction) {

    // } else {
    //   return 
    // }
    return false;
  }

  removeLineSection(section: LineSection) {
    this.selfLineSectionList.filter(sec => {
      return sec.uuid !== section.uuid;
    })
  }
  addLineSection(section: LineSection) {

  }
}

class LineSection {
  constructor(startPoint: Point, endPoint: Point) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.line = this.startPoint.lineList.filter(lineSt => {
      let found = false;
      this.endPoint.lineList.forEach(lineEd => {
        if (lineEd.uuid === lineSt.uuid) {
          found = true;
        }
      });
      return found;
    })[0];
  }
  uuid: number = Id.id;
  line: Line;
  startPoint: Point;
  endPoint: Point;

  split(otherLine: Line, secPoint: Point) {
    let firstSection = new LineSection(this.startPoint, secPoint);
    let secondSection = new LineSection(secPoint, this.endPoint);

    this.startPoint.removetoLineSectionList(this);  //remove old relation
    this.endPoint.removefromLineSectionList(this);
    this.line.removeLineSection(this);

    this.line.addLineSection(firstSection); //add new relation
    this.line.addLineSection(secondSection);
    secPoint.addLineList(otherLine);
    secPoint.addLineList(this.line);
    secPoint.addfromLineSectionList(firstSection);
    secPoint.addtoLineSectionList(secondSection);
  }

}

class Polygon {

}

class Solver {
  intersectionPointList: Array<Point>;
  linesectionList: Array<LineSection>;
  lineList: Array<Line>;

  addLine(line: Line) {
    if (this.lineList.length === 0) {
      this.lineList.push(line);
    } else {
      this.lineList.forEach(storedline => {
        storedline.interSectWithLine(line);
      })
      this.lineList.push(line);
    }
  }

}


function solveAll(inputLines: Array<Line>) {
  let solver = new Solver();
  inputLines.forEach(inputline => {
    solver.addLine(inputline);
  })
}