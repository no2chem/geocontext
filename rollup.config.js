import replace from 'rollup-plugin-replace';

export default {
    entry: 'build/src/geocontext.js',
    format: 'cjs',
    plugins: [
        replace({
            'process.browser': process.env.BROWSER === "true"
        })
    ]
};