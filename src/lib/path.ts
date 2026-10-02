export function url(path:string) {
  return path.startsWith('/') && !path.startsWith('//') ? `/flockbuilt-demo${path}` : path;
}
