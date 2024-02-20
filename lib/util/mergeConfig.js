const acorn = require("acorn");
const escodegen = require("escodegen");
const remove = require("lodash/remove");
/**
 * 合并vue.config.js
 * @param target 目标配置
 * @param source 源配置
 */
module.exports = (target, ...source) => {
  if (!target) {
    target = "module.export = {}";
  }
  const code = source.reduce((acc, config) => {
    if (config) {
      acc = mergeConfigCodeAst(acc, parseCode(config));
    }
    return acc;
  }, parseCode(target));
  return escodegen.generate(code);
};

function parseCode(codeStr) {
  return acorn.parse(codeStr, {
    ecmaVersion: "latest",
  });
}

function mergeConfigCodeAst(targetAst, sourceAst) {
  // merge variable
  mergeVariable(targetAst, sourceAst);
  // merge property
  mergeProperty(targetAst, sourceAst);
  return targetAst;
}

function mergeVariable(targetAst, sourceAst) {
  const getVariableList = (ast) =>
    remove(ast.body, (i) => i.type === "VariableDeclaration");
  const targetVariableList = getVariableList(targetAst);
  const sourceVariableList = getVariableList(sourceAst);
  if (targetVariableList) {
    // 这里暂时只处理单变量
    const getVariableKey = (variable) => variable.declarations[0].id.name;
    sourceVariableList.forEach((sourceVariable) => {
      const sourceVariableKeyName = getVariableKey(sourceVariable);
      // 存在不相同的key，进行合并
      if (
        !targetVariableList.find(
          (targetVariable) =>
            getVariableKey(targetVariable) === sourceVariableKeyName
        )
      ) {
        targetVariableList.push(sourceVariable);
      }
    });
    targetAst.body.unshift(...targetVariableList);
  } else if (sourceVariableList) {
    targetAst.body.unshift(...sourceVariableList);
  }
}

function mergeProperty(targetAst, sourceAst) {
  const getPropertyList = (ast) =>
    ast.body?.find((i) => i.type === "ExpressionStatement")?.expression?.right
      ?.properties;
  const targetPropertyList = getPropertyList(targetAst);
  const sourcePropertyList = getPropertyList(sourceAst);

  if (targetPropertyList) {
    const getPropertyKey = (property) => property.key.name;
    sourcePropertyList.forEach((sourceProperty) => {
      const sourcePropertyKeyName = getPropertyKey(sourceProperty);
      let targetPropertyWithSameKey;
      // 存在相同的key，进行合并
      if (
        (targetPropertyWithSameKey = targetPropertyList.find(
          (targetProperty) =>
            getPropertyKey(targetProperty) === sourcePropertyKeyName
        ))
      ) {
        const getExpression = (property) => property.value.body.body;
        getExpression(targetPropertyWithSameKey).push(
          ...getExpression(sourceProperty)
        );
      } else {
        // 不存在，追加
        targetPropertyList.push(sourceProperty);
      }
    });
  } else if (sourcePropertyList) {
    targetAst.body.push(...sourcePropertyList);
  }
}
