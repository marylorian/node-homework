import fs from "fs";
import path from "path";
import csvtojson from "csvtojson";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handleEndOfExecution = () => {
  console.info("Program is successfully finishing...");
  process.exit(0);
};

const handleError = (err) => {
  console.error("[Error]: Something went wrong,\n", err);
  process.exit(1);
};

const getWriteStream = () => {
  const resultFilePath = path.join(__dirname, "./results/test.txt");
  const resultsDirPath = path.resolve(__dirname, "./results");

  if (!fs.existsSync(resultsDirPath)) {
    console.info("Creating resulting directory and file...");
    fs.mkdirSync(resultsDirPath, { recursive: true }, handleError);
  } else if (!fs.existsSync(resultFilePath)) {
    console.info("Creating result file...");
    fs.writeFileSync(resultFilePath, "", handleError);
  } else {
    console.info("Clearing old data from result file...");
    fs.writeFileSync(resultFilePath, "", handleError);
  }

  return fs.createWriteStream(resultFilePath, { flags: "a" });
};

(function () {
  try {
    const csvFilePath = path.join(__dirname, "./csv", "/test.csv");
    const readStream = fs.createReadStream(csvFilePath);

    const resultFilePath = path.join(__dirname, "./results/test.txt");
    const writeStream = getWriteStream(resultFilePath);

    csvtojson({ delimiter: ";" })
      .fromStream(readStream)
      .preRawData((rawData) =>
        rawData
          .split("\n")
          .filter(Boolean)
          .map((str) =>
            str
              .split(";")
              .filter((value) => value && value !== "\r")
              .join(";")
          )
          .join("\n")
      )
      .subscribe(
        (json) => {
          console.info("Read new line from file", JSON.stringify(json));
          return new Promise((resolve, reject) => {
            try {
              const result = Object.entries(json).reduce(
                (acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }),
                {}
              );
              const newLineToFile = JSON.stringify(result);

              writeStream.write(newLineToFile + "\n");
              console.info("Written new line to file", newLineToFile);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
        },
        handleError,
        handleEndOfExecution
      );
  } catch (err) {
    handleError(err);
  }
})();
