<?php
// Sidebar items. 'access' is the group of users who can see the item.
function menu_items(): array
{
    return [
        ['route' => 'home',              'label' => 'Home',                   'access' => 'general'],
        ['route' => 'enlistment',        'label' => 'Enlistment',             'access' => 'student'],
        ['route' => 'add-drop',          'label' => 'Add / Drop',             'access' => 'student'],
        ['route' => 'special-class',     'label' => 'Special Class',          'access' => 'student'],
        ['route' => 'withdrawal',        'label' => 'Course Withdrawal',      'access' => 'student'],
        ['route' => 'program-exchange',  'label' => 'Program Exchange',       'access' => 'student'],
        ['route' => 'curriculum',        'label' => 'Curriculum Progression', 'access' => 'student'],
        ['route' => 'schedule',          'label' => 'View Schedule',          'access' => 'general'],
        ['route' => 'records',           'label' => 'View Records',           'access' => 'student'],
        ['route' => 'calendar',          'label' => 'University Calendar',    'access' => 'general'],
        ['route' => 'organizations',     'label' => 'Organizations',          'access' => 'general'],
        ['route' => 'grade-encoding',    'label' => 'Grade Encoding',         'access' => 'teacher'],
        ['route' => 'applications',      'label' => 'View Application',       'access' => 'teacher'],
        ['route' => 'announcements',     'label' => 'Make Announcements',     'access' => 'office'],
        ['route' => 'accounts',          'label' => 'Account Management',     'access' => 'admin'],
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
