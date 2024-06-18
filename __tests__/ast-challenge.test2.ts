const generate = require("@babel/generator").default;
const t = require("@babel/types");
const template = require("@babel/template").default;
const jsonExample = require("./../example-methods.json");

function genAst(name, { requestType, responseType }) {
  const key = name.toLowerCase();
  const ast = template.ast(
    `
export interface Use${name}Query<TData> extends ReactQueryParams<${responseType}, TData> {  
  request?: ${requestType};  
  }
const use${name} = <TData = ${responseType}>({
    request,
    options,
  }: Use${name}Query<TData>) => {
    return useQuery<${responseType}, Error, TData>(
      ["${key}Query", request],
      () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.${key}(request);
      },
      options
    );
  };
`,
    { plugins: ["typescript"] }
  );
  return ast;
}

export function genAstFromJson(json) {
  return Object.keys(json).reduce((arr, key) => {
    arr.push(...genAst(key, json[key]));
    return arr;
  }, [] as any[]);
}

const expectCode = (ast) => {
  const code = generate(t.file(t.program(ast))).code;
  expect(code).toMatchSnapshot();
};

it("works", () => {
  const astArray = genAstFromJson(jsonExample);
  expectCode(astArray);
});
