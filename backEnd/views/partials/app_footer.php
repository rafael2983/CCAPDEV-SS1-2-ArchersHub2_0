
        </main>

        <footer class="footer-section">
            <p>2026 ArchersHub 2.0</p>
            <p>Privacy Policy | Conditions</p>
        </footer>

        <div class="overlay" id="overlay"></div>
    </div>
    <?php if ($flash = take_flash()): ?>
    <div class="toast-container" aria-live="polite">
        <div class="toast <?= e($flash['type']) ?>"><?= e($flash['message']) ?></div>
    </div>
    <?php endif; ?>
</body>
</html>
