// Grade Encoding: suggestion list for the grade boxes.
// The valid grades are already on the page (data-grades), so nothing is fetched.
(function () {
    var body = document.getElementById('grade-students-body');
    if (!body) {
        return;
    }

    var grades = [];
    try {
        grades = JSON.parse(body.getAttribute('data-grades') || '[]');
    } catch (err) {
        grades = [];
    }
    if (!grades.length) {
        return;
    }

    var list = document.createElement('ul');
    list.className = 'grade-suggest';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    document.body.appendChild(list);

    var current = null;  // the grade box being used
    var items = [];      // grades currently shown
    var active = -1;     // highlighted row (keyboard)

    // Grades that start with the text come first. If none do, grades that contain it
    // (or whose description contains it) are shown.
    function matches(text, showAll) {
        var t = text.trim().toLowerCase().replace(',', '.');
        if (showAll || t === '') {
            return grades.slice();
        }
        var starts = grades.filter(function (g) {
            return g.grade_value.toLowerCase().indexOf(t) === 0;
        });
        if (starts.length) {
            return starts;
        }
        return grades.filter(function (g) {
            return g.grade_value.toLowerCase().indexOf(t) !== -1
                || g.description.toLowerCase().indexOf(t) !== -1;
        });
    }

    function hide() {
        list.hidden = true;
        active = -1;
    }

    function highlight(index) {
        var rows = list.children;
        for (var i = 0; i < rows.length; i++) {
            rows[i].classList.toggle('active', i === index);
        }
        active = index;
    }

    function show(input, showAll) {
        current = input;
        items = matches(input.value, showAll);
        if (!items.length) {
            hide();
            return;
        }

        list.textContent = '';
        items.forEach(function (g) {
            var li = document.createElement('li');
            li.setAttribute('role', 'option');
            var value = document.createElement('strong');
            value.textContent = g.grade_value;
            var desc = document.createElement('span');
            desc.textContent = g.description;
            li.appendChild(value);
            li.appendChild(desc);
            list.appendChild(li);
        });

        var box = input.getBoundingClientRect();
        list.style.left = box.left + 'px';
        list.style.top = box.bottom + 'px';
        list.style.minWidth = Math.max(box.width, 170) + 'px';
        list.hidden = false;
        active = -1;
    }

    function choose(index) {
        if (!current || !items[index]) {
            return;
        }
        current.value = items[index].grade_value;
        hide();
        current.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function isGradeBox(el) {
        return el && el.classList && el.classList.contains('grade-input');
    }

    // Clicking the box selects its text and shows every grade.
    document.addEventListener('focusin', function (e) {
        if (isGradeBox(e.target)) {
            e.target.select();
            show(e.target, true);
        }
    });

    // Typing narrows the list.
    document.addEventListener('input', function (e) {
        if (isGradeBox(e.target)) {
            show(e.target, false);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!isGradeBox(e.target)) {
            return;
        }
        if (list.hidden) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                show(e.target, true);
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlight(Math.min(active + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlight(Math.max(active - 1, 0));
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            choose(active);
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            hide();
        }
    });

    document.addEventListener('focusout', function (e) {
        if (isGradeBox(e.target)) {
            hide();
        }
    });

    // mousedown (not click) so the box keeps focus while a grade is picked.
    list.addEventListener('mousedown', function (e) {
        var li = e.target.closest('li');
        if (!li) {
            return;
        }
        e.preventDefault();
        choose(Array.prototype.indexOf.call(list.children, li));
    });

    window.addEventListener('resize', hide);
    window.addEventListener('scroll', function (e) {
        if (e.target !== list) {
            hide();
        }
    }, true);
})();