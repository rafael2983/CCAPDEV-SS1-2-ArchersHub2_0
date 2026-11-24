<?php
// Sidebar items. 'access' is the group of users who can see the item.
function menu_items(): array
{
    return [
        ['route' => 'home',              'label' => 'Home',                   'access' => 'general', 'icon' => 'home'],
        ['route' => 'enlistment',        'label' => 'Enlistment',             'access' => 'student', 'icon' => 'list'],
        ['route' => 'add-drop',          'label' => 'Add / Drop',             'access' => 'student', 'icon' => 'swap'],
        ['route' => 'special-class',     'label' => 'Special Class',          'access' => 'student', 'icon' => 'star'],
        ['route' => 'withdrawal',        'label' => 'Course Withdrawal',      'access' => 'student', 'icon' => 'exit'],
        ['route' => 'program-exchange',  'label' => 'Program Exchange',       'access' => 'student', 'icon' => 'swap'],
        ['route' => 'curriculum',        'label' => 'Curriculum Progression', 'access' => 'student', 'icon' => 'path'],
        ['route' => 'schedule',          'label' => 'View Schedule',          'access' => 'general', 'icon' => 'clock'],
        ['route' => 'records',           'label' => 'View Records',           'access' => 'student', 'icon' => 'doc'],
        ['route' => 'calendar',          'label' => 'University Calendar',    'access' => 'general', 'icon' => 'calendar'],
        ['route' => 'organizations',     'label' => 'Organizations',          'access' => 'general', 'icon' => 'people'],
        ['route' => 'grade-encoding',    'label' => 'Grade Encoding',         'access' => 'teacher', 'icon' => 'edit'],
        ['route' => 'applications',      'label' => 'View Application',       'access' => 'teacher', 'icon' => 'inbox'],
        ['route' => 'announcements',     'label' => 'Make Announcements',     'access' => 'office', 'icon' => 'megaphone'],
        ['route' => 'accounts',          'label' => 'Account Management',     'access' => 'admin', 'icon' => 'user'],
    ];
}

// Which access groups each database role can see.
function role_access(string $role): array
{
    return match ($role) {
        'Student'          => ['general', 'student'],
        'Teacher'          => ['general', 'teacher'],
        'APO', 'Provost'   => ['general', 'office'],
        'Admin'            => ['general', 'student', 'teacher', 'office', 'admin'],
        default            => ['general'],
    };
}

// Returns the inner SVG shapes for a sidebar icon name.
function menu_icon(string $name): string
{
    $icons = [
        'home'      => '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
        'list'      => '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
        'swap'      => '<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>',
        'star'      => '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z"/>',
        'exit'      => '<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9"/>',
        'path'      => '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-4h6"/>',
        'clock'     => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        'doc'       => '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
        'calendar'  => '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        'people'    => '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 2 4 5"/>',
        'edit'      => '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
        'inbox'     => '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
        'megaphone' => '<path d="M3 10v4h4l8 5V5L7 10z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
        'user'      => '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
        'logout'    => '<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9"/>',
    ];
    $shapes = $icons[$name] ?? '<circle cx="12" cy="12" r="3"/>';
    return '<svg class="side-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" '
         . 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '
         . 'aria-hidden="true">' . $shapes . '</svg>';
}