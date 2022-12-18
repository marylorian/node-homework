(function () {
  process.stdin.setEncoding("utf8");
  process.stdin.on("readable", () => {
    const input = process.stdin.read();

    if (!input || input === "\n") {
      console.info("[info]: input is empty");
    } else {
      process.stdout.write(
        `${input.toString().split("").reverse().join("")}\n`
      );
    }
  });
})();
