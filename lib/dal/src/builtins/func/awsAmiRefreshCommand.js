async function refresh(component) {
    // Initialize the input JSON.
    const object = {
        "ImageIds": [component.properties.domain.ImageId],
    };

    // Now, create the key pair.
    const child = await siExec.waitUntilEnd("aws", [
        "ec2",
        "describe-images",
        "--region",
        component.properties.domain.region,
        "--cli-input-json",
        JSON.stringify(object),
    ]);

    if (child.exitCode !== 0) {
        throw new Error(`Failure running aws ec2 describe-images (${child.exitCode}): ${child.stderr}`);
    }

    const images = (JSON.parse(child.stdout) || {})["Images"];
    if (!images || images.length === 0) {
        throw new Error(`Image not found (${child.exitCode}): ${child.stderr}`);
    }

    return { value: images[0] };
}