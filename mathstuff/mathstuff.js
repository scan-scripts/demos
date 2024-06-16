const parser = math.parser()
let msg = "x^2+2*2-1"
let parsed_exp = math.parse(msg)
try {
    let compiled_exp = parsed_exp.compile();
    let exp_as_func = x => compiled_exp.evaluate({ x: x })
    console.log(parsed_exp.toTex());
    console.log(exp_as_func(5));
} catch (error) {
    console.log("invalid syntax")
}

