<?php

namespace Puth\FakeClasses;

use Puth\GenericObject;

/**
 * Class Browser
 * @package Puth\FakeClasses
 *
 * @method addListener(object $event, object $handler)
 * @method browserContexts()
 * @method close()
 * @method createIncognitoBrowserContext()
 * @method defaultBrowserContext()
 * @method disconnect()
 * @method emit(object $event, mixed $eventData = null)
 * @method isConnected()
 * @method listenerCount(string $event)
 * @method newPage()
 * @method off(object $event, object $handler)
 * @method on(object $eventName, callable $handler)
 * @method once(object $eventName, callable $handler)
 * @method pages()
 * @method process()
 * @method removeAllListeners(string $event = null)
 * @method removeListener(object $event, object $handler)
 * @method target()
 * @method targets()
 * @method userAgent()
 * @method version()
 * @method waitForTarget(callable $predicate, array $options = null)
 * @method wsEndpoint()
*/
class Browser extends GenericObject {}