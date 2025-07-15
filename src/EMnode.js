/*
    EM Node

    author: bruno.fanini_AT_gmail.com

===========================================================*/

/**
Class
@class EM
@example 
new EMNode()
*/
export default class EMNode {
  constructor() {
    this.line = [];
    this.dashed = [];
    this.dotted = [];
    this.double_line = [];
    this.dashed_dotted = [];
    //this.parents  = [];

    this.type = undefined;
    this.time = undefined;
    this.period = undefined;
    this.description = undefined;
    this.label = undefined;
    this.url = undefined;

    this.timeStart = undefined;
    this.timeEnd = undefined;
    this.graph = undefined;
  }

  addChild(N, relation) {
    if (relation == "line") this.line.push(N);
    else if (relation == "dashed") this.dashed.push(N);
    else if (relation == "dotted") this.dotted.push(N);
    else if (relation == "double_line") this.double_line.push(N);
    else if (relation == "dashed_dotted") this.dashed_dotted.push(N);
    //N.parents.push(this);
  }

  getChild(i, relation) {
    if (relation == "line") return this.line[i];
    else if (relation == "dashed") return this.dashed[i];
    else if (relation == "dotted") return this.dashed[i];
    else if (relation == "double_line") return this.double_line[i];
    else if (relation == "dashed_dotted") return this.dashed_dotted[i];
  }

  isLeaf() {
    if (this.children.length > 0) return false;
    return true;
  }
}
