import * as core from "@actions/core";
import { JARDeployment, NPMDeployment, OpenApiYML } from "./models/OpenApiYML";
import AngularTypescriptPublisher from "./publisher/AngularPublisher";
import KotlinPublisher from "./publisher/KotlinPublisher";
import SpringPublisher from "./publisher/SpringPublisher";
import { FileService } from "./service/FileService";
import Constants from "./utils/Constants";


async function main() {

    core.notice(Constants.SCHEMA_FILE_PATH)

    const schemaFile = await FileService.readYML<OpenApiYML>(Constants.SCHEMA_FILE_PATH);
    const deploymentNames = Object.keys(schemaFile["x-deploy"])
    const deploymentValues = Object.values(schemaFile["x-deploy"])

    core.notice(`Found ${deploymentNames.length} deployments`);
    core.notice(`Deployments: ${deploymentNames.join(", ")}`);

    deploymentNames.forEach(async deploymentName => {
        switch (deploymentName) {
            case "kotlin":
                core.notice(`Found Kotlin deployment`);

                const kotlinDeployment = schemaFile["x-deploy"].kotlin as JARDeployment

                core.notice(`Kotlin package artifact: ${kotlinDeployment.artifact}`);
                core.notice(`Kotlin package group: ${kotlinDeployment.group}`);
                await KotlinPublisher.publish(kotlinDeployment.artifact, kotlinDeployment.group, schemaFile.info.version);
                break;
            case "spring":
                core.notice(`Found Spring deployment`);
                const springDeployment = schemaFile["x-deploy"].spring as JARDeployment
                core.notice(`Spring package artifact: ${springDeployment.artifact}`);
                core.notice(`Spring package group: ${springDeployment.group}`);
                await SpringPublisher.publish(springDeployment.artifact, springDeployment.group, schemaFile.info.version);
                break;
            case "typescript-angular":
                core.notice(`Found TypeScript Angular deployment`);
                const typescriptAngularDeployment = schemaFile["x-deploy"]["typescript-angular"] as NPMDeployment
                core.notice(`TypeScript Angular package name: ${typescriptAngularDeployment.name}`);
                await AngularTypescriptPublisher.publish(typescriptAngularDeployment.name);
                break;
            default:
                core.error(`Unknown deployment: ${deploymentName}`);
                break;
        }
    });
    
}

main()
.then(() => {
    core.notice("Deployment complete");
})
.catch(error => {
    core.setFailed(error.message);
})