async function create(component) {
  console.log(component);

  const child = await siExec.waitUntilEnd("skopeo", ["inspect", "--override-os", "linux", "--override-arch", "amd64", `docker://docker.io/${component.properties.domain.image}`]);
  if (child.exitCode !== 0) {
    throw new Error(child.stderr);
  }

  console.log(child.stdout);
  const object = JSON.parse(child.stdout);
  const key = object.Name;

  if (component.resources.find((r) => r.key === key)) {
    throw new Error("resource already exists");
  } else {
    return { created: { [key]: object } };
  }
}