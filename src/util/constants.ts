export default class Constants {
  static readonly PLATFORMS = "PLATFORMS";
  static readonly GITHUB_USERNAME = "GITHUB_USERNAME";
  static readonly GITHUB_TOKEN = "GITHUB_TOKEN";
  static readonly OPEN_API_FILE_PATH = "OPEN_API_FILE_PATH";
  static readonly OUTPUT_PATH = "OUTPUT_PATH";
  static readonly NPM_TOKEN = "NPM_TOKEN";
  static readonly GRADLE_DISTRIBUTION = (
    owner: string,
    repoName: string,
    githubToken: string
  ) => `
  repositories {
    maven {
        name = "GitHubPackages"
        url = "https://maven.pkg.github.com/${owner}/${repoName}"
        credentials {
        username = System.getenv(${owner})
        password = System.getenv(${githubToken})
        }
    }
  `;
  static readonly SETTINGS_XML = (
    githubUsername: string,
    githubToken: string
  ) => `
  <settings>
    <servers>
      <server>
        <id>github</id>
        <username>${githubUsername}</username>
        <password>${githubToken}</password>
      </server>
    </servers>
  </settings>
  `
  static readonly POM_DISTRIBUTION = (owner: string, repoName: string) => `
        <distributionManagement>
            <repository>
                <id>github</id>
                <name>GitHub ${owner} Apache Maven Packages</name>
                <url>https://maven.pkg.github.com/${owner}/${repoName}</url>
            </repository>
        </distributionManagement>
    </project>
    `;
  static readonly POM_PROPERTIES = `
        <spring-boot.repackage.skip>true</spring-boot.repackage.skip>
    </properties>`;
}
