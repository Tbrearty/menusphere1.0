script 
// ... (previous code)

// Position menu items evenly on the surface of each sphere
menuItems.forEach((item, index) => {
    const radius = item.sphere.geometry.parameters.radius;
    const angle = (index / menuItems.length) * Math.PI * 2;

    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    // ... (create canvas and texture as before)

    const plane = new THREE.Mesh(menuItemGeometry, material);
    plane.position.set(x, y, 0);

    // Calculate tangent vector
    const tangent = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0); 

    // Align the plane with the tangent
    plane.lookAt(new THREE.Vector3(0, 0, 0).add(tangent));

    item.sphere.add(plane);
});

// ... (rest of the code) 