'use strict';

function FileTreeNode(nodeId, name, type) {
  const children = [];

  this.nodeId = nodeId;
  this.name = name;
  this.type = type;
  this.parentNode = null;

  this.setParent = function (parentNode) {
    this.parentNode = parentNode;
  };

  this.addChild = function (node) {
    if (this.type !== 'DIRECTORY') {
      throw "Cannot add child node to a non-directory node";
    }
    children.push(node);
    node.setParent(this);
  };

  this.getChildren = function () {
    return children;
  };
};

function FileTree() {
  this.nodes = [];

  this.getRootNodes = function () {
    const result = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].parentNode) {
        result.push(this.nodes[i]);
      }
    }
    return result;
  };

  this.getParentNode = function (parentId, input) {
    // step 1: check if parent node exist
    const existParentNode = this.findNodeById(parentId);
    if (existParentNode) {
      return existParentNode;
    }

    // step 2: prepare nodes to be created
    const nodesToCreate = [];
    let parentNodeId = parentId;
    do {
      const parentNodeInInput = input.find((i) => i.id === parentNodeId);
      parentNodeId = parentNodeInInput && parentNodeInInput.parentId;
      nodesToCreate.push(parentNodeInInput);
    } while (parentNodeId);

    // step 3: filter already existing nodes and create required
    nodesToCreate
      .filter(node => this.nodes.find((n) => n.nodeId !== node.id))
      .reverse()
      .forEach((node) => {
        const parentNode = node.parentId ? this.findNodeById(node.parentId) : null;
        this.createNode(node.id, node.name, node.type, parentNode);
      });

    // step 4: return parent node for initial inputNode
    const createdParent = this.findNodeById(parentId);
    return createdParent;
  };

  this.findNodeById = function (nodeId) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].nodeId === nodeId) {
        return this.nodes[i];
      }
    }
    return null;
  };

  this.createNode = function (nodeId, name, type, parentNode) {
    const node = new FileTreeNode(nodeId, name, type);
    if (parentNode) {
      parentNode.addChild(node);
    }
    this.nodes.push(node);
  }
};

export function createFileTree(input) {
  const fileTree = new FileTree();
  for (const inputNode of input) {
    if (!fileTree.findNodeById(inputNode.id)) {
      const parentNode = inputNode.parentId ? fileTree.getParentNode(inputNode.parentId, input) : null;
      fileTree.createNode(inputNode.id, inputNode.name, inputNode.type, parentNode);
    }
  }
  return fileTree;
}
