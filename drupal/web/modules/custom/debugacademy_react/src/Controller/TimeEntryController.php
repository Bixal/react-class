<?php

namespace Drupal\debugacademy_react\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class TimeEntryController.
 */
class TimeEntryController extends ControllerBase {

  /**
   * Enter time tracking.
   *
   * @return string
   *   Return Time entry container.
   */
  public function time_entry() {
    $page_render_array = [
      '#type' => 'markup',
      '#type' => 'markup',
      '#markup' => '<div id="react-timesheet"></div>'
    ];
    // Add React Timesheet App to page.
    $page_render_array['#attached']['library'][] = 'debugacademy_react/timesheet';
    return $page_render_array;
  }

}
