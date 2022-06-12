const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const PROJ_DIR = __dirname + '/../';
const SRC_DIR = PROJ_DIR + '/src/';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = (webpackEnv) => {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    return {
        mode: isEnvProduction ? 'production' : 'development',
        devtool: isEnvProduction ? undefined : 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                    },
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.wasm.bin$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: '[hash][name]',
                    },
                },
            ],
        },
        output: {
            publicPath: '',
            path: path.resolve(PROJ_DIR, 'dist'),
            filename: '[name]-[contenthash:8].js',
            sourceMapFilename: '[name]-[contenthash:8].js.map',
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.json', '.mjs', '.wasm'],
            alias: {
                '@': path.resolve(SRC_DIR),
                '@root': path.resolve(PROJ_DIR),
            },
        },
        plugins: [
            new HTMLPlugin({
                template: path.join(PROJ_DIR, 'src/index.html'),
            }),
            new WebpackManifestPlugin({
                fileName: 'assets-manifest.json',
                generate: (seed, files, entrypoints) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        manifest[file.name] = file.path;
                        return manifest;
                    }, seed);
                    const entrypointFiles = entrypoints.main.filter(
                        (fileName) => !fileName.endsWith('.map'),
                    );
                    return {
                        files: manifestFiles,
                        entrypoints: entrypointFiles,
                    };
                },
            }),
        ],
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    framework: {
                        name: 'framework',
                        chunks: 'all',
                        test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                        priority: 40,
                    },
                    lib: {
                        test(module) {
                            return (
                                module.size() > 160000 &&
                                /node_modules[/\\]/.test(module.identifier())
                            );
                        },
                        name(module) {
                            const rawRequest =
                                module.rawRequest &&
                                module.rawRequest.replace(
                                    /^@(\w+)[/\\]/,
                                    '$1-',
                                );
                            if (rawRequest) return rawRequest;

                            const identifier = module.identifier();
                            const trimmedIdentifier =
                                /(?:^|[/\\])node_modules[/\\](.*)/.exec(
                                    identifier,
                                );
                            const processedIdentifier =
                                trimmedIdentifier &&
                                trimmedIdentifier[1].replace(
                                    /^@(\w+)[/\\]/,
                                    '$1-',
                                );

                            return processedIdentifier || identifier;
                        },
                        priority: 30,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 1,
                        priority: 20,
                    },
                    shared: {
                        name(module, chunks) {
                            return crypto
                                .createHash('sha1')
                                .update(
                                    chunks.reduce((acc, chunk) => {
                                        return acc + chunk.name;
                                    }, ''),
                                )
                                .digest('base64')
                                .replace(/\//g, '');
                        },
                        priority: 10,
                        minChunks: 2,
                        reuseExistingChunk: true,
                    },
                },
                maxInitialRequests: 20,
            },
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        },
        devServer: {
            host: '0.0.0.0',
            port: 8080,
            proxy: {},
            historyApiFallback: true,
            disableHostCheck: true,
            contentBase: path.resolve(PROJ_DIR, 'dist'),
            mimeTypes: { 'application/wasm': ['wasm.bin'] },
        },
        externals: {
            fs: true,
            path: true,
        },
    };
};
