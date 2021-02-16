export class EventEmitter<TMap extends BaseTypeMap<unknown>> {
  private _map = new Map<string, Set<EventCallback<any, TMap>>>();

  addEventListener<K extends keyof TMap>(
    name: K,
    callback: EventCallback<K, TMap>
  ) {
    const key = name.toString();
    const currentEventCallbackSet =
      this._map.get(key) ?? new Set<EventCallback<K, TMap>>();
    currentEventCallbackSet.add(callback);

    this._map.set(key, currentEventCallbackSet);
  }

  removeEventListener<K extends keyof TMap>(
    name: K,
    callback: EventCallback<K, TMap>
  ) {
    const key = name.toString();
    const currentEventCallbackSet = this._map.get(key);

    if (currentEventCallbackSet != null) {
      currentEventCallbackSet.delete(callback);
    }
  }

  trigger<K extends keyof TMap>(name: K, value: TMap[K]) {
    const key = name.toString();
    const currentEventCallbackSet = this._map.get(key);

    currentEventCallbackSet?.forEach((callback) => callback(value));
  }
}

type EventCallback<K extends keyof TMap, TMap extends BaseTypeMap<unknown>> = (
  event: TMap[K]
) => void;

window.addEventListener;

type BaseTypeMap<T> = {
  [k in keyof T]: unknown;
};
