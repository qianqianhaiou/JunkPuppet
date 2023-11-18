module.exports = {
  packagerConfig: {
    asar: true,
    name: "JunkPuppet",
    icon: "public/robot",
    ignore: (url) => {
      if (
        !url.startsWith("/") ||
        url.startsWith("/dist") ||
        url.startsWith("/dist-eletron") ||
        url.startsWith("/node_modules") ||
        url.startsWith("/public") ||
        url.startsWith("/package.json")
      ) {
        return false;
      } else {
        return true;
      }
    },
  },
  rebuildConfig: {},
  // makers: [
  //   {
  //     name: "@electron-forge/maker-squirrel",
  //     // config: {
  //     //   iconUrl:
  //     //     "C:\\Users\\admin\\Desktop\\electron-box\\electrondemo\\public\\robot.ico",
  //     //   setupIcon:
  //     //     "C:\\Users\\admin\\Desktop\\electron-box\\electrondemo\\public\\robot.ico",
  //     // },
  //   },
  //   {
  //     name: "@electron-forge/maker-zip",
  //     platforms: ["darwin"],
  //   },
  //   {
  //     name: "@electron-forge/maker-deb",
  //     config: {},
  //   },
  //   {
  //     name: "@electron-forge/maker-rpm",
  //     config: {},
  //   },
  // ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
};
