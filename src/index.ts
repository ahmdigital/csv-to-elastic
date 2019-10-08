import {
  map,
  keyBy,
  keys,
  reduce,
  uniq,
  filter,
  some,
  size,
  values
} from "lodash/fp";
import { Client } from "@elastic/elasticsearch";
import csv from "csvtojson";
import program from "commander";
import Sentiment from "sentiment";
import stemmer from "stemmer";

program
  .option("-f, --file <filePath>", "csv file to put into elasticsearch")
  .option("-k, --key <key string>", "key for elasticsearch");

program.parse(process.argv);

const elasticClient = new Client({ node: "http://localhost:9200" });

const sentiment = new Sentiment();

const minimumInterestingDataLength = 300;

const getMeta = (item: Object, qualitativeFields: string[]) =>
  keyBy(
    "field",
    map(
      qualitativeField => ({
        field: qualitativeField,
        sentiment: sentiment.analyze(item[qualitativeField]),
        stemmed: stemmer(item[qualitativeField])
      }),
      qualitativeFields
    )
  );

const getUniqueFields = (jsonArray: Object[]) =>
  reduce((s: string[], o: object) => uniq([...s, ...keys(o)]), [], jsonArray);

const getQualitativeFields = (jsonArray: Object[]) =>
  filter(
    fieldName =>
      some(
        arrayItem => size(arrayItem[fieldName]) > minimumInterestingDataLength,
        jsonArray
      ),
    getUniqueFields(jsonArray)
  );

const go = async (csvFilePath: string, index: string) => {
  const jsonArray = await csv().fromFile(csvFilePath);

  const qualitativeFields = getQualitativeFields(jsonArray);

  const bodies = jsonArray.map(item => ({
    ...item,
    id: JSON.stringify(values(item)[0]),
    meta: getMeta(item, qualitativeFields)
  }));

  for (const body of bodies) {
    await elasticClient
      .index({ index, body, type: "_doc" })
      .catch(console.error);
  }
  console.log(bodies.length, index);
};
console.log({file: program.file, key: program.key});

go(program.file, program.key).catch(console.error);
