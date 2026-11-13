<?php require __DIR__ . '/../partials/app_header.php'; ?>

<?php
// Mock organization data
$organizations = [
    [
        "id" => 1,
        "name" => "La Salle Computer Society",
        "description" => "A student organization dedicated to technology, programming, and computer science through workshops, events, and collaborative activities."
    ],
    [
        "id" => 2,
        "name" => "DLSU Pusa",
        "description" => "A student-led organization advocating for animal welfare, particularly the care and well-being of cats around the university."
    ],
    [
        "id" => 3,
        "name" => "National Honor Society (NHK)",
        "description" => "A student organization that promotes academic excellence, leadership, service, and personal development."
    ],
    [
        "id" => 4,
        "name" => "DLSU Engineering Society",
        "description" => "An organization that encourages engineering students to develop their technical skills and participate in academic and social activities."
    ],
    [
        "id" => 5,
        "name" => "DLSU Chorale",
        "description" => "A musical organization that brings students together through choral performances, music appreciation, and artistic collaboration."
    ]
];
?>

<h1 class="page-title">Organizations</h1>

<div class="organizations">

    <section class="card" id="org-browse">
        <h2>Browse organizations</h2>

        <label for="org-search">Search</label>
        <input type="search" id="org-search" placeholder="Search by organization name">

        <div class="org-list" id="org-list">

            <?php foreach ($organizations as $org): ?>
                <article class="card org-card" data-org="<?= htmlspecialchars($org['id']) ?>">

                    <h3><?= htmlspecialchars($org['name']) ?></h3>

                    <p><?= htmlspecialchars($org['description']) ?></p>

                    <button class="row-btn add" data-action="apply">
                        Apply
                    </button>

                </article>
            <?php endforeach; ?>

        </div>

        <p class="empty" id="org-empty" hidden>
            No organizations match your search.
        </p>
    </section>

    <section class="card" id="org-applications">
        <h2>My applications</h2>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody id="org-app-body">
                    <tr>
                        <td colspan="3" class="empty">
                            You have not applied to any organization.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

</div>

<?php require __DIR__ . '/../partials/app_footer.php'; ?>