# Shortlinks
(Firefox) Browser Extension for Shortlinks to make navigating to frequent pages easier.

## Examples
Typing `c/` will open Google Calendar.

## Building from Source
You need a valid closure compiler aliased to `closurecompiler`. Then, execute:

```bash
closurecompiler --js_output_file build/background-compiled.js "src/background/shortlinks.js" "src/util/**.js"
closurecompiler --js_output_file build/options-compiled.js "src/options/options.js"
```

Alternatively, if you don't want to alias the compiler, just replace `closurecompiler`
with `java -jar /path/to/closurecompiler.jar`.
