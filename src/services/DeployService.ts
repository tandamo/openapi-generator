import * as fs from "fs";
import Constants from "../util/constants";
import yaml from "js-yaml";
import { execute } from "../util/syncToAsync";
import * as core from "@actions/core";
import * as github from "@actions/github";

const githubUsername = core.getInput(Constants.GITHUB_USERNAME);
const githubToken = core.getInput(Constants.GITHUB_TOKEN);

const openApiPath = core.getInput(Constants.OPEN_API_FILE_PATH);
const outputPath = core.getInput(Constants.OUTPUT_PATH);

const repoName = github.context.repo.repo as string;
const ownerName = github.context.repo.owner as string;

const dottedArtifact = repoName.replace(/-/g, ".");
const firstArtifact = dottedArtifact.split(".")[0];

export default class DeployService {
  static async handleAngular() {
    const ymlFile = await fs.promises.readFile(openApiPath, "utf8");
    const yml: any = yaml.load(ymlFile);

    const version = yml.info.version;

    core.notice("Repository name: " + repoName);
    core.notice("OpenAPI file path: " + openApiPath);
    core.notice("OpenAPI version: " + version);

    await execute(
      `npx @openapitools/openapi-generator-cli generate -i ${openApiPath} -g typescript-angular -o ${outputPath} --git-user-id "${ownerName}" --git-repo-id "${repoName}" --additional-properties=npmName=@${ownerName}/${repoName},npmRepository=https://npm.pkg.github.com/`
    );
    core.notice(`Generated Angular code`);

    await execute(`cd ${outputPath}; npm install`);
    core.notice(`npm Install`);

    await execute(`cd ${outputPath}; npm run build`);
    core.notice(`npm run build`);

//     await fs.promises.writeFile(
//       `${outputPath}/dist/.npmrc`,
// `
// //npm.pkg.github.com/:_authToken=${githubToken}
// @${ownerName}:registry=https://npm.pkg.github.com
// always-auth=true
// `,
//       "utf8"
//     );
//     core.notice(`Created .npmrc`);

//     await execute(`cd ${outputPath}/dist; npm publish`);
//     core.notice(`npm publish`);
  }

  static async handleKotlinSpring() {
    const ymlFile = await fs.promises.readFile(openApiPath, "utf8");
    const yml: any = yaml.load(ymlFile);

    const version = yml.info.version;

    core.notice("Repository name: " + repoName);
    core.notice("OpenAPI file path: " + openApiPath);
    core.notice("OpenAPI version: " + version);

    await execute(
      `npx @openapitools/openapi-generator-cli generate -i ${openApiPath} -g kotlin-spring -o ${outputPath} --git-user-id "${ownerName}" --git-repo-id "${repoName}" --additional-properties=delegatePattern=true,apiPackage=de.${dottedArtifact},artifactId=${repoName},basePackage=de.${firstArtifact},artifactVersion=${version},packageName=de.${firstArtifact},title=${repoName}`
    );
    core.notice(`Generated Kotlin Spring code`);

    const pomFile = await fs.promises.readFile(`${outputPath}/pom.xml`, "utf8");

    const newPomFile = pomFile
      .replace("</project>", Constants.POM_DISTRIBUTION(ownerName, repoName))
      .replace("</properties>", Constants.POM_PROPERTIES);
    core.notice(`Modified project and properties in pom.xml`);

    await fs.promises.writeFile(`${outputPath}/pom.xml`, newPomFile, "utf8");
    core.notice(`Updated pom.xml`);

    await fs.promises.writeFile(
      __dirname + "/settings.xml",
      `<settings><servers><server><id>github</id><username>${githubUsername}</username><password>${githubToken}</password></server></servers></settings>`,
      "utf8"
    );
    core.notice(`Created settings.xml`);

    await execute(
      `cd ${outputPath}; mvn deploy --settings ${__dirname}/settings.xml -DskipTests`
    );
    core.notice(`Deployed to GitHub Packages`);
  }
}