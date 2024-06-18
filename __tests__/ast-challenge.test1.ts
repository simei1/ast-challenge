const generate = require("@babel/generator").default;
const t = require("@babel/types");
const template = require("@babel/template").default;
const jsonExample = require("./../example-methods.json");

const tpl = `
export interface INTERFACE_NAME <TData> extends ReactQueryParams<RESPONSETYPE, TData> {  
  request?: REQUESTTYPE;  
  }
const HOOK_NAME = <TData = RESPONSETYPE>({
    request,
    options,
  }: INTERFACE_NAME<TData>) => {
    return useQuery<RESPONSETYPE, Error, TData>(
      [KEY_NAME, request],
      () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.SERVICE_METHOD(request);
      },
      options
    );
  };
`;

function genAst(
  name: string,
  { requestType, responseType }: { requestType: string; responseType: string }
) {
  const buildRequire = template(tpl, { plugins: ["typescript"] });
  const key = name.toLowerCase();
  const ast = buildRequire({
    INTERFACE_NAME: t.identifier(`Use${name}Query`),
    HOOK_NAME: t.identifier(`use${name}`),
    KEY_NAME: t.stringLiteral(`${key}Query`),
    SERVICE_METHOD: t.identifier(key),
    REQUESTTYPE: t.identifier(requestType),
    RESPONSETYPE: t.identifier(responseType),
  });
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
