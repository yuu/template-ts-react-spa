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
                    defaultVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                        name: 'vendor',
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
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
        },
    };
};
